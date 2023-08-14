import TransparentUpgradeableProxy from 'openzeppelin-solidity/artifacts-zk/contracts/proxy/TransparentUpgradeableProxy.sol/TransparentUpgradeableProxy.json'
import createDeployContractStep from './meta/createDeployContractStep'
import { ZkSyncArtifact } from '@matterlabs/hardhat-zksync-deploy/src/types'

export const DEPLOY_TRANSPARENT_PROXY_DESCRIPTOR = createDeployContractStep({
  key: 'descriptorProxyAddress',
  async computeArtifact() {
    return {
      artifact: TransparentUpgradeableProxy as ZkSyncArtifact,
    }
  },
  computeArguments(state) {
    if (state.nonfungibleTokenPositionDescriptorAddressV1_3_0 === undefined) {
      throw new Error('Missing NonfungibleTokenPositionDescriptor')
    }
    if (state.proxyAdminAddress === undefined) {
      throw new Error('Missing ProxyAdmin')
    }
    return [state.nonfungibleTokenPositionDescriptorAddressV1_3_0, state.proxyAdminAddress, '0x']
  },
})
