import UniswapInterfaceMulticall from 'v3-periphery/artifacts-zk/contracts/lens/UniswapInterfaceMulticall.sol/UniswapInterfaceMulticall.json'
import createDeployContractStep from './meta/createDeployContractStep'

export const DEPLOY_MULTICALL2 = createDeployContractStep({
  key: 'multicall2Address',
  computeArtifact() {
    return UniswapInterfaceMulticall
  }
})
