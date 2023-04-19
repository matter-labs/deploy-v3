import '@matterlabs/hardhat-zksync-solc'
import 'hardhat-dependency-compiler'

export default {
  defaultNetwork: 'zkSyncTestnet',
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
      'v3-periphery-1_3_0/contracts/NonfungibleTokenPositionDescriptor.sol',
    ],
  },
}
