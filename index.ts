import { Wallet, Provider } from 'zksync-web3'
import { TransactionReceipt } from '@ethersproject/providers'
import { AddressZero } from '@ethersproject/constants'
import { getAddress } from '@ethersproject/address'
import fs from 'fs'
import deploy from './src/deploy'
import {MigrationState, StepOutput} from './src/migrations'
import { asciiStringToBytes32 } from './src/util/asciiStringToBytes32'

export async function deployV3(args: any) {
  if (!/^0x[a-zA-Z0-9]{64}$/.test(args.privateKey)) {
    console.error('Invalid private key!')
    process.exit(1)
  }

  let url: URL
  try {
    url = new URL(args.jsonRpc)
  } catch (error) {
    console.error('Invalid JSON RPC URL', (error as Error).message)
    process.exit(1)
  }

  let gasPrice: number | undefined
  try {
    gasPrice = args.gasPrice ? parseInt(args.gasPrice) : undefined
  } catch (error) {
    console.error('Failed to parse gas price', (error as Error).message)
    process.exit(1)
  }

  let confirmations: number
  try {
    confirmations = parseInt(args.confirmations)
  } catch (error) {
    console.error('Failed to parse confirmations', (error as Error).message)
    process.exit(1)
  }

  let nativeCurrencyLabelBytes: string
  try {
    nativeCurrencyLabelBytes = asciiStringToBytes32(args.nativeCurrencyLabel)
  } catch (error) {
    console.error('Invalid native currency label', (error as Error).message)
    process.exit(1)
  }

  let weth9Address: string
  try {
    weth9Address = getAddress(args.weth9Address)
  } catch (error) {
    console.error('Invalid WETH9 address', (error as Error).message)
    process.exit(1)
  }

  let v2CoreFactoryAddress: string
  if (typeof args.v2CoreFactoryAddress === 'undefined') {
    v2CoreFactoryAddress = AddressZero
  } else {
    try {
      v2CoreFactoryAddress = getAddress(args.v2CoreFactoryAddress)
    } catch (error) {
      console.error('Invalid V2 factory address', (error as Error).message)
      process.exit(1)
    }
  }

  let ownerAddress: string
  try {
    ownerAddress = getAddress(args.ownerAddress)
  } catch (error) {
    console.error('Invalid owner address', (error as Error).message)
    process.exit(1)
  }

  const wallet = new Wallet(args.privateKey, new Provider({url: url.href}))

  let state: MigrationState
  if (fs.existsSync(args.state)) {
    try {
      state = JSON.parse(fs.readFileSync(args.state, {encoding: 'utf8'}))
    } catch (error) {
      console.error('Failed to load and parse migration state file', (error as Error).message)
      process.exit(1)
    }
  } else {
    state = {}
  }

  let finalState: MigrationState
  const onStateChange = async (newState: MigrationState): Promise<void> => {
    fs.writeFileSync(args.state, JSON.stringify(newState))
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
              (stepResult): Promise<TransactionReceipt | true> => {
                if (stepResult.hash) {
                  return wallet.provider.waitForTransaction(stepResult.hash, confirmations, /* 15 minutes */ 1000 * 60 * 15)
                } else {
                  return Promise.resolve(true)
                }
              }
          )
      )
    }

    return results
  }

  let results: StepOutput[][]
  try {
    results = await run()
  } catch (error) {
    console.error('Deployment failed', error)
    console.log('Final state')
    console.log(JSON.stringify(finalState))
    process.exit(1)
  }

  console.log('Deployment succeeded')
  console.log(JSON.stringify(results))
  console.log('Final state')
  console.log(JSON.stringify(finalState))
  process.exit(0)
}