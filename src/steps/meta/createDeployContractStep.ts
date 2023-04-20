import { ContractInterface } from '@ethersproject/contracts'
import { Contract, ContractFactory } from 'zksync-web3'
import { Deployer } from '@matterlabs/hardhat-zksync-deploy'
import { ZkSyncArtifact } from "@matterlabs/hardhat-zksync-deploy/dist/types";
import { MigrationConfig, MigrationState, MigrationStep } from '../../migrations'
const hre = require("hardhat")

type ConstructorArgs = (string | number)[]

export default function createDeployContractStep({
  key,
  computeArtifact,
  computeArguments,
}: {
  key: keyof MigrationState
  computeArtifact: (state: Readonly<MigrationState>, config: MigrationConfig) => Promise<ZkSyncArtifact>
  computeArguments?: (state: Readonly<MigrationState>, config: MigrationConfig) => ConstructorArgs
}): MigrationStep {

  return async (state, config) => {
    const artifact = await computeArtifact(state, config)
    if (state[key] === undefined) {
      const constructorArgs: ConstructorArgs = computeArguments ? computeArguments(state, config) : []
      if (artifact.linkReferences && Object.keys(artifact.linkReferences).length > 0) {
        throw new Error('Missing function to compute library addresses')
      }

      const deployer = new Deployer(hre, config.signer)

      let contract: Contract
      try {
        contract = await deployer.deploy(artifact, constructorArgs, { gasPrice: config.gasPrice })
      } catch (error) {
        console.error(`Failed to deploy ${artifact.contractName}`)
        throw error
      }

      state[key] = contract.address

      return [
        {
          message: `Contract ${artifact.contractName} deployed`,
          address: contract.address,
          hash: contract.deployTransaction.hash,
        },
      ]
    } else {
      return [{ message: `Contract ${artifact.contractName} was already deployed`, address: state[key] }]
    }
  }
}
