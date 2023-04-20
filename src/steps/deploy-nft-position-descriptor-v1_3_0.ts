import createDeployContractStep from './meta/createDeployContractStep'
const hre = require("hardhat")

export const DEPLOY_NFT_POSITION_DESCRIPTOR_V1_3_0 = createDeployContractStep({
  key: 'nonfungibleTokenPositionDescriptorAddressV1_3_0',
  async computeArtifact(state) {
    if (state.nftDescriptorLibraryAddressV1_3_0 === undefined) {
      throw new Error('NFTDescriptor library missing')
    }
    hre.config.zksolc.settings.libraries = {
      "v3-periphery-1_3_0/contracts/libraries/NFTDescriptor.sol": {
        NFTDescriptor: state.nftDescriptorLibraryAddressV1_3_0,
      },
    }
    hre.config.dependencyCompiler.paths = ['v3-periphery-1_3_0/contracts/NonfungibleTokenPositionDescriptor.sol']
    await hre.run("compile")
    return hre.artifacts.readArtifactSync('NonfungibleTokenPositionDescriptor')
  },
  computeArguments(_, { weth9Address, nativeCurrencyLabelBytes }) {
    return [weth9Address, nativeCurrencyLabelBytes]
  },
})
