import TickLens from '@uniswap/v3-periphery/artifacts-zk/contracts/lens/TickLens.sol/TickLens.json'
import createDeployContractStep from './meta/createDeployContractStep'
import { ZkSyncArtifact } from '@matterlabs/hardhat-zksync-deploy/src/types'

export const DEPLOY_TICK_LENS = createDeployContractStep({
  key: 'tickLensAddress',
  async computeArtifact() {
    return {
      artifact: TickLens as ZkSyncArtifact
    }
  },
})
