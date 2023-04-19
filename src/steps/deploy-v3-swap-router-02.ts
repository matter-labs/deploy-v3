import SwapRouter02 from 'swap-router-contracts/artifacts-zk/contracts/SwapRouter02.sol/SwapRouter02.json'
import createDeployContractStep from './meta/createDeployContractStep'

export const DEPLOY_V3_SWAP_ROUTER_02 = createDeployContractStep({
  key: 'swapRouter02',
  async computeArtifact() {
    return SwapRouter02
  },
  computeArguments(state, config) {
    if (state.v3CoreFactoryAddress === undefined) {
      throw new Error('Missing V3 Core Factory')
    }
    if (state.nonfungibleTokenPositionManagerAddress === undefined) {
      throw new Error('Missing NFT manager')
    }

    return [
      config.v2CoreFactoryAddress,
      state.v3CoreFactoryAddress,
      state.nonfungibleTokenPositionManagerAddress,
      config.weth9Address,
    ]
  },
})
