import UniswapV3Factory from 'v3-core/artifacts-zk/contracts/UniswapV3Factory.sol/UniswapV3Factory.json'
import createDeployContractStep from './meta/createDeployContractStep'

export const DEPLOY_V3_CORE_FACTORY = createDeployContractStep({
  key: 'v3CoreFactoryAddress',
  computeArtifact() {
    return UniswapV3Factory
  },
})
