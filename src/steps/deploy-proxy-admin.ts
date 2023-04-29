import ProxyAdmin from 'openzeppelin-solidity/artifacts-zk/contracts/proxy/ProxyAdmin.sol/ProxyAdmin.json'
import createDeployContractStep from './meta/createDeployContractStep'
import { ZkSyncArtifact } from '@matterlabs/hardhat-zksync-deploy/src/types'

export const DEPLOY_PROXY_ADMIN = createDeployContractStep({
  key: 'proxyAdminAddress',
  async computeArtifact() {
    return {
      artifact: ProxyAdmin as ZkSyncArtifact
    }
  },
})
