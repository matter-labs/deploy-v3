import UniswapV3Factory from '@uniswap/v3-core/artifacts-zk/contracts/UniswapV3Factory.sol/UniswapV3Factory.json'
import UniswapV3Pool from '@uniswap/v3-core/artifacts-zk/contracts/UniswapV3Pool.sol/UniswapV3Pool.json'
import createDeployContractStep from './meta/createDeployContractStep'
import { ZkSyncArtifact } from '@matterlabs/hardhat-zksync-deploy/src/types'

export const DEPLOY_V3_CORE_FACTORY = createDeployContractStep({
  key: 'v3CoreFactoryAddress',
  async computeArtifact() {
    return {
      artifact: UniswapV3Factory as any,
      factoryDepsArtifacts: [UniswapV3Pool as ZkSyncArtifact],
    }
  },
})
