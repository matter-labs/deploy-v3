import createDeployContractStep from './meta/createDeployContractStep'
import { execSync } from 'child_process'
import fs from 'fs';

export const DEPLOY_NFT_POSITION_DESCRIPTOR_V1_3_0 = createDeployContractStep({
  key: 'nonfungibleTokenPositionDescriptorAddressV1_3_0',
  computeArtifact(state) {
    if (state.nftDescriptorLibraryAddressV1_3_0 === undefined) {
      throw new Error('NFTDescriptor library missing')
    }
    process.env.NFT_DESCRIPTOR_ADDRESS = state.nftDescriptorLibraryAddressV1_3_0
    execSync('yarn --cwd v3-periphery-1_3_0 hardhat compile --network zkSyncTestnet')
    const file = fs.readFileSync('v3-periphery-1_3_0/artifacts-zk/contracts/NonfungibleTokenPositionDescriptor.sol/NonfungibleTokenPositionDescriptor.json')
    return JSON.parse(file.toString())
  },
  computeArguments(_, { weth9Address, nativeCurrencyLabelBytes }) {
    return [weth9Address, nativeCurrencyLabelBytes]
  },
})
