import { ethers } from "ethers"
import { Contract } from "zksync-ethers"

const { Provider, Wallet } = require('zksync-ethers')
const hre = require('hardhat')
const dotenv = require('dotenv')
const { encodeSqrtRatioX96, nearestUsableTick, NonfungiblePositionManager, Position, Pool } = require('@uniswap/v3-sdk')
const { Percent, Token } = require('@uniswap/sdk-core')
const { UNISWAP_FACTOR_ABI, UNISWAP_V3_POOL_ABI, ERC20_ABI } = require('./abi.ts')


dotenv.config();

const rpcUrl: string = 'https://rpc.testnet.lens.dev';
const provider = new Provider(rpcUrl);
const wallet = new Wallet('insert_private_key', provider);

/**
 * Get a contract instance
 * @param address - Contract address
 * @param abi - Contract ABI
 * @returns Contract instance
 */
async function getContract(address: string, abi: any[]): Promise<Contract> {
  return new ethers.Contract(address, abi, wallet);
}

async function main(): Promise<void> {
  const token0Address: string = '0x19178EA74C13b6Ef054a4560086Fa349Bf7c3447';
  const token1Address: string = '0xeee5a340Cdc9c179Db25dea45AcfD5FE8d4d3eB8';
  const fee: number = 0.01 * 10000;
  const token0Decimals: number = 6;
  const token1Decimals: number = 18;
  const price: ethers.BigNumber = encodeSqrtRatioX96(1, 100000);

  const npmca: string = '0xBAd1E96356123BaB341c8e0031d7935ECD65cDc3';
  const uniswapFactoryAddress: string = '0x7eAF6b0646DE8CA11658447b427E62674BFEc9d1';
  const amount0: ethers.BigNumber = ethers.utils.parseUnits('1000000', 6);
  const amount1: ethers.BigNumber = ethers.utils.parseUnits('10', 18);
  const chainID: number = 37111;

  console.log('Initializing contracts');
  const uniswapFactoryContract = await getContract(
    uniswapFactoryAddress,
    UNISWAP_FACTOR_ABI
  );
  const token0 = await getContract(token0Address, ERC20_ABI);
  const token1 = await getContract(token1Address, ERC20_ABI);

  let poolAddress: string = await uniswapFactoryContract.getPool(token0Address, token1Address, fee);

  if (poolAddress === ethers.constants.AddressZero) {
    console.log('Creating new pool');
    poolAddress = await createPool(uniswapFactoryContract, token0Address, token1Address, fee);
    console.log('Initializing pool');
    await initializePool(poolAddress, price);
  }

  await addLiquidityToPool(
    poolAddress,
    chainID,
    token0Decimals,
    token1Decimals,
    token0,
    token1,
    amount0,
    amount1,
    fee,
    npmca
  );
}

/**
 * Create a pool
 * @param factory - Uniswap factory contract
 * @param token0 - Address of token0
 * @param token1 - Address of token1
 * @param fee - Pool fee
 * @returns Pool address
 */
async function createPool(
  factory: Contract,
  token0: string,
  token1: string,
  fee: number
): Promise<string> {
  const gasPrice: ethers.BigNumber = await provider.getGasPrice();
  const tx = await factory.createPool(token0, token1, fee, { maxFeePerGas: gasPrice, });
  await tx.wait();
  console.log("Pool Created")
  return factory.getPool(token0, token1, fee);
}

/**
 * Initialize a pool
 * @param poolAddress - Address of the pool
 * @param price - Initial price
 */
async function initializePool(poolAddress: string, price: ethers.BigNumber): Promise<void> {
  const poolContract: Contract = new ethers.Contract(poolAddress, UNISWAP_V3_POOL_ABI, wallet);
  const tx = await poolContract.initialize(price.toString());
  await tx.wait();
}

/**
 * Add liquidity to a pool
 * @param poolAddress - Pool address
 * @param chainId - Chain ID
 * @param token0Decimals - Decimals of token0
 * @param token1Decimals - Decimals of token1
 * @param token0 - Contract instance of token0
 * @param token1 - Contract instance of token1
 * @param amount0 - Amount of token0
 * @param amount1 - Amount of token1
 * @param fee - Pool fee
 * @param npmca - Nonfungible position manager address
 */
async function addLiquidityToPool(
  poolAddress: string,
  chainId: number,
  token0Decimals: number,
  token1Decimals: number,
  token0: Contract,
  token1: Contract,
  amount0: ethers.BigNumber,
  amount1: ethers.BigNumber,
  fee: number,
  npmca: string
): Promise<void> {
  const poolContract: Contract = new ethers.Contract(poolAddress, UNISWAP_V3_POOL_ABI, wallet);
  const state = await getPoolState(poolContract);

  const token0Instance = new Token(chainId, token0.address, token0Decimals);
  const token1Instance = new Token(chainId, token1.address, token1Decimals);

  const configuredPool = new Pool(
    token0Instance,
    token1Instance,
    fee,
    state.sqrtPriceX96.toString(),
    state.liquidity.toString(),
    state.tick
  );

  const position = Position.fromAmounts({
    pool: configuredPool,
    tickLower:
      nearestUsableTick(configuredPool.tickCurrent, configuredPool.tickSpacing) -
      configuredPool.tickSpacing * 2,
    tickUpper:
      nearestUsableTick(configuredPool.tickCurrent, configuredPool.tickSpacing) +
      configuredPool.tickSpacing * 2,
    amount0: amount0.toString(),
    amount1: amount1.toString(),
    useFullPrecision: true,
  });

  const mintOptions = {
    recipient: wallet.address,
    deadline: Math.floor(Date.now() / 1000) + 60 * 20,
    slippageTolerance: new Percent(50, 10_000),
  };

  const { calldata, value } = NonfungiblePositionManager.addCallParameters(position, mintOptions);

  const tx = await wallet.sendTransaction({
    data: calldata,
    to: npmca,
    value,
  });
  await tx.wait();
}

/**
 * Get the current pool state
 * @param poolContract - Pool contract instance
 * @returns Pool state
 */
async function getPoolState(poolContract: Contract): Promise<{
  liquidity: ethers.BigNumber;
  sqrtPriceX96: ethers.BigNumber;
  tick: number;
  observationIndex: number;
  observationCardinality: number;
  observationCardinalityNext: number;
  feeProtocol: number;
  unlocked: boolean;
}> {
  const liquidity = await poolContract.liquidity();
  const slot = await poolContract.slot0();

  return {
    liquidity,
    sqrtPriceX96: slot[0],
    tick: slot[1],
    observationIndex: slot[2],
    observationCardinality: slot[3],
    observationCardinalityNext: slot[4],
    feeProtocol: slot[5],
    unlocked: slot[6],
  };
}

main().catch(console.error);
