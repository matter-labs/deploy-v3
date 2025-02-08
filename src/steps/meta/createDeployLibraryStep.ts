import { ContractFactory } from 'zksync-web3'
import { MigrationState, MigrationStep } from '../../migrations'
import { ZkSyncArtifact } from '@matterlabs/hardhat-zksync-deploy/src/types'

export default function createDeployLibraryStep({
  key,
  artifact,
}: {
  key: keyof MigrationState
  artifact: ZkSyncArtifact
}): MigrationStep {
  return async (state, { signer, gasPrice }) => {
    if (state[key] === undefined) {
      if (Object.keys(artifact.factoryDeps).length !== 0) {
        throw new Error('Factory deps for the library: `' + artifact.contractName + '` is not empty')
      }

      const factory = new ContractFactory(artifact.abi, artifact.bytecode, signer)

      try {
        const library = await factory.deploy({
          gasPrice: gasPrice, // Use gasPrice instead of maxFeePerGas
          // Remove maxPriorityFeePerGas
          // Remove customData.factoryDeps if not necessary
        })

        await library.deployed()

        state[key] = library.address

        return [
          {
            message: `Library ${artifact.contractName} deployed`,
            address: library.address,
            hash: library.deployTransaction.hash,
          },
        ]
      } catch (error) {
        console.error(`Failed to deploy library ${artifact.contractName}:`, error)
        throw error
      }
    } else {
      return [{ message: `Library ${artifact.contractName} was already deployed`, address: state[key] }]
    }
  }
}
