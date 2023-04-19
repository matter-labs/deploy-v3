import V3Migrator from 'v3-periphery/artifacts-zk/contracts/V3Migrator.sol/V3Migrator.json'
import createDeployContractStep from './meta/createDeployContractStep'

export const DEPLOY_V3_MIGRATOR = createDeployContractStep({
  key: 'v3MigratorAddress',
  async computeArtifact() {
    return V3Migrator
  },
  computeArguments(state, config) {
    if (state.v3CoreFactoryAddress === undefined) {
      throw new Error('Missing V3 Core Factory')
    }
    if (state.nonfungibleTokenPositionManagerAddress === undefined) {
      throw new Error('Missing NonfungiblePositionManager')
    }
    return [state.v3CoreFactoryAddress, config.weth9Address, state.nonfungibleTokenPositionManagerAddress]
  },
})
