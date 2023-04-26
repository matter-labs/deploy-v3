import '@matterlabs/hardhat-zksync-solc'
import 'hardhat-dependency-compiler'
import { task } from 'hardhat/config'
import {deployV3} from './index'

task('deploy-v3')
  .addParam('privateKey', 'Private key used to deploy all contracts')
  .addParam('jsonRpc', 'JSON RPC URL where the program should be deployed')
  .addParam('weth9Address', 'Address of the WETH9 contract on this chain')
  .addParam('nativeCurrencyLabel', 'Native currency label, e.g. ETH')
  .addParam('ownerAddress', 'Contract address that will own the deployed artifacts after the script runs')
  .addOptionalParam('state', 'Path to the JSON file containing the migrations state (optional)', './state.json')
  .addOptionalParam('v2CoreFactoryAddress', 'The V2 core factory address used in the swap router (optional)')
  .addOptionalParam('gasPrice', 'The gas price to pay in GWEI for each transaction (optional)')
  .addOptionalParam('confirmations', 'How many confirmations to wait for after each transaction (optional)', '2')
  .setAction(async (taskArgs) => {
    await deployV3(taskArgs)
  })

export default {
  networks: {
    hardhat: {
      allowUnlimitedContractSize: false,
      zksync: true,
    },
  },
  solidity: {
    version: '0.7.6',
    settings: {
      optimizer: {
        enabled: true,
      },
      metadata: {
        bytecodeHash: 'none',
      },
    },
  },
  zksolc: {
    version: "1.3.10",
    compilerSource: "binary",
    settings: {},
  },
  dependencyCompiler: {
    paths: [
      'v3-periphery-1_3_0/contracts/NonfungibleTokenPositionDescriptor.sol',
    ],
  },
}
