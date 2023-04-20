import UniswapV3Factory from '../../artifacts-zk/v3-core/contracts/UniswapV3Factory.sol/UniswapV3Factory.json'
import createDeployContractStep from './meta/createDeployContractStep'
import { ZkSyncArtifact } from "@matterlabs/hardhat-zksync-deploy/src/types";

export const DEPLOY_V3_CORE_FACTORY = createDeployContractStep({
  key: 'v3CoreFactoryAddress',
  async computeArtifact() {
    // TODO: think about factory deps without compiling in the current context
    return UniswapV3Factory as ZkSyncArtifact
  },
})
