import * as zk from 'zksync-web3'
import * as ethers from 'ethers'
import { ZkSyncArtifact } from '@matterlabs/hardhat-zksync-deploy/src/types'
import { MigrationConfig, MigrationState, MigrationStep } from '../../migrations'

type ConstructorArgs = (string | number | string[] | number[])[]

export default function createDeployContractStep({
  key,
  computeArtifact,
  computeArguments,
}: {
  key: keyof MigrationState
  computeArtifact: (
    state: Readonly<MigrationState>,
    config: MigrationConfig
  ) => Promise<{
    artifact: ZkSyncArtifact
    factoryDepsArtifacts?: ZkSyncArtifact[]
  }>
  computeArguments?: (state: Readonly<MigrationState>, config: MigrationConfig) => ConstructorArgs
}): MigrationStep {
  return async (state, config) => {
    let { artifact, factoryDepsArtifacts } = await computeArtifact(state, config)
    factoryDepsArtifacts = factoryDepsArtifacts ? factoryDepsArtifacts : []

    if (state[key] === undefined) {
      const constructorArgs: ConstructorArgs = computeArguments ? computeArguments(state, config) : []
      if (artifact.linkReferences && Object.keys(artifact.linkReferences).length > 0) {
        throw new Error('Link references should be empty for ZkSyncArtifact')
      }

      const visited = new Set<string>()
      visited.add(`${artifact.sourceName}:${artifact.contractName}`)
      let factoryDeps: string[] = extractFactoryDeps(artifact, factoryDepsArtifacts, visited)

      const factory = new zk.ContractFactory(artifact.abi, artifact.bytecode, config.signer)

      let contract: zk.Contract
      try {
        contract = await factory.deploy(...constructorArgs, {
          gasPrice: config.gasPrice, // Use gasPrice instead of maxFeePerGas
          customData: {
            // Remove factoryDeps if not necessary
            // factoryDeps,
          },
        })
      } catch (error) {
        console.error(`Failed to deploy ${artifact.contractName}:`, error)
        throw error
      }

      state[key] = contract.address

      return [
        {
          message: `Contract ${artifact.contractName} deployed`,
          address: contract.address,
          constructorArgs: constructorArgs,
          hash: contract.deployTransaction.hash,
        },
      ]
    } else {
      return [{ message: `Contract ${artifact.contractName} was already deployed`, address: state[key] }]
    }
  }
}

function extractFactoryDeps(
  artifact: ZkSyncArtifact,
  knownArtifacts: ZkSyncArtifact[],
  visited: Set<string>
): string[] {
  const factoryDeps: string[] = []

  for (const dependencyHash in artifact.factoryDeps) {
    const dependencyContract = artifact.factoryDeps[dependencyHash]

    if (!visited.has(dependencyContract)) {
      const dependencyArtifact = knownArtifacts.find((dependencyArtifact) => {
        return (
          dependencyArtifact.sourceName + ':' + dependencyArtifact.contractName === dependencyContract &&
          ethers.utils.hexlify(zk.utils.hashBytecode(dependencyArtifact.bytecode)) === dependencyHash
        )
      })
      if (dependencyArtifact === undefined) {
        throw new Error('Dependency: `' + dependencyContract + '` is not found')
      }

      factoryDeps.push(dependencyArtifact.bytecode)
      visited.add(dependencyContract)
      const transitiveDeps = extractFactoryDeps(dependencyArtifact, knownArtifacts, visited)
      factoryDeps.push(...transitiveDeps)
    }
  }

  return factoryDeps
}
