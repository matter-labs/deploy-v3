import { ContractInterface } from '@ethersproject/contracts'
import { Contract, ContractFactory } from 'zksync-web3'
import { MigrationConfig, MigrationState, MigrationStep } from '../../migrations'

type ConstructorArgs = (string | number | string[] | number[])[]

export default function createDeployContractStep({
  key,
  computeArtifact,
  computeArguments,
}: {
  key: keyof MigrationState
  computeArtifact: (state: Readonly<MigrationState>, config: MigrationConfig) => {
    contractName: string
    abi: ContractInterface
    bytecode: string
    linkReferences?: { [fileName: string]: { [contractName: string]: { length: number; start: number }[] } }
  }
  computeArguments?: (state: Readonly<MigrationState>, config: MigrationConfig) => ConstructorArgs
}): MigrationStep {

  return async (state, config) => {
    const { contractName, abi, bytecode, linkReferences } = computeArtifact(state, config)
    if (state[key] === undefined) {
      const constructorArgs: ConstructorArgs = computeArguments ? computeArguments(state, config) : []
      if (linkReferences && Object.keys(linkReferences).length > 0) {
        throw new Error('Missing function to compute library addresses')
      }

      const factory = new ContractFactory(
        abi,
        bytecode,
        config.signer
      )

      let contract: Contract
      try {
        contract = await factory.deploy(...constructorArgs, { gasPrice: config.gasPrice })
      } catch (error) {
        console.error(`Failed to deploy ${contractName}`)
        throw error
      }

      state[key] = contract.address

      return [
        {
          message: `Contract ${contractName} deployed`,
          address: contract.address,
          hash: contract.deployTransaction.hash,
        },
      ]
    } else {
      return [{ message: `Contract ${contractName} was already deployed`, address: state[key] }]
    }
  }
}
