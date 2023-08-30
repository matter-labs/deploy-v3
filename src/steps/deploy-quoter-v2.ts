import QuoterV2 from '@uniswap/swap-router-contracts/artifacts-zk/contracts/lens/QuoterV2.sol/QuoterV2.json'
import createDeployContractStep from './meta/createDeployContractStep'
import { ZkSyncArtifact } from '@matterlabs/hardhat-zksync-deploy/src/types'

export const DEPLOY_QUOTER_V2 = createDeployContractStep({
  key: 'quoterV2Address',
  async computeArtifact() {
    return {
      artifact: QuoterV2 as ZkSyncArtifact,
    }
  },
  computeArguments(state, config) {
    if (state.v3CoreFactoryAddress === undefined) {
      throw new Error('Missing V3 Core Factory')
    }
    return [state.v3CoreFactoryAddress, config.weth9Address]
  },
})
