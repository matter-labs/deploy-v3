import '@matterlabs/hardhat-zksync-solc'
import 'hardhat-dependency-compiler'

export default {
  networks: {
    hardhat: {
      allowUnlimitedContractSize: false,
      zksync: true,
    },
    zkSyncTestnet: {
      url: "https://testnet.era.zksync.dev",
      ethNetwork: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      zksync: true,
    },
    zkSyncLocalhost: {
      url: "http://localhost:3050",
      ethNetwork: "http://localhost:8545",
      zksync: true,
    }
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
    version: "1.3.9",
    compilerSource: "binary",
    settings: {},
  },
  dependencyCompiler: {
    paths: [
      'v3-core/contracts/UniswapV3Factory.sol',
    ],
  },
}
