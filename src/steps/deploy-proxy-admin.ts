import ProxyAdmin from 'openzeppelin-contracts/artifacts-zk/contracts/proxy/ProxyAdmin.sol/ProxyAdmin.json'
import createDeployContractStep from './meta/createDeployContractStep'

export const DEPLOY_PROXY_ADMIN = createDeployContractStep({
  key: 'proxyAdminAddress',
  async computeArtifact() {
    return ProxyAdmin
  },
})
