import UniswapInterfaceMulticall from '@uniswap/v3-periphery/artifacts-zk/contracts/lens/UniswapInterfaceMulticall.sol/UniswapInterfaceMulticall.json'
import createDeployContractStep from './meta/createDeployContractStep'
import { ZkSyncArtifact } from '@matterlabs/hardhat-zksync-deploy/src/types'

export const DEPLOY_MULTICALL2 = createDeployContractStep({
  key: 'multicall2Address',
  async computeArtifact() {
    return {
      artifact: UniswapInterfaceMulticall as ZkSyncArtifact
    }
  }
})
