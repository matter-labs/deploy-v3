import { Wallet, Provider } from 'zksync-web3'
import { TransactionResponse } from '@ethersproject/providers'
import { AddressZero } from '@ethersproject/constants'
import { getAddress } from '@ethersproject/address'
import fs from 'fs'
import deploy from './src/deploy'
import { MigrationState } from './src/migrations'
import { asciiStringToBytes32 } from './src/util/asciiStringToBytes32'
const hre = require("hardhat")

// TODO: think how to pass args
const privateKey: string = '0xac1e735be8536c6534bb4f17f06f6afc73b2b5ba84ac2cfb12f7461b20c0bbe3'

// TODO: think how to sync url with hardhat env
const url: URL = new URL('http://localhost:3050')

const gasPrice: number | undefined = undefined

const nativeCurrencyLabelBytes: string = asciiStringToBytes32('ETH')

const weth9Address: string = getAddress('0xa61464658AfeAf65CccaaFD3a512b69A83B77618')

const v2CoreFactoryAddress: string = AddressZero

const ownerAddress: string = getAddress('0x36615Cf349d7F6344891B1e7CA7C72883F5dc049')

const statePath: string = './state.json'


const wallet = new Wallet(privateKey, new Provider({ url: url.href }))

let state: MigrationState
if (fs.existsSync(statePath)) {
  try {
    state = JSON.parse(fs.readFileSync(statePath, { encoding: 'utf8' }))
  } catch (error) {
    console.error('Failed to load and parse migration state file', (error as Error).message)
    process.exit(1)
  }
} else {
  state = {}
}

let finalState: MigrationState
const onStateChange = async (newState: MigrationState): Promise<void> => {
  fs.writeFileSync(statePath, JSON.stringify(newState))
  finalState = newState
}

async function run() {
  let step = 1
  const results = []
  const generator = deploy({
    signer: wallet,
    gasPrice,
    nativeCurrencyLabelBytes,
    v2CoreFactoryAddress,
    ownerAddress,
    weth9Address,
    initialState: state,
    onStateChange,
  })

  for await (const result of generator) {
    console.log(`Step ${step++} complete`, result)
    results.push(result)

    // wait 15 minutes for any transactions sent in the step
    await Promise.all(
      result.map(
        async (stepResult): Promise<TransactionResponse | true> => {
          // TODO: think about confirmations
          if (stepResult.hash) {
            return await wallet._providerL2().getTransaction(stepResult.hash);
          } else {
            return Promise.resolve(true)
          }
        }
      )
    )
  }

  return results
}

run()
  .then((results) => {
    console.log('Deployment succeeded')
    console.log(JSON.stringify(results))
    console.log('Final state')
    console.log(JSON.stringify(finalState))
    process.exit(0)
  })
  .catch((error) => {
    console.error('Deployment failed', error)
    console.log('Final state')
    console.log(JSON.stringify(finalState))
    process.exit(1)
  })
