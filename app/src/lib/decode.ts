import type {
  AbiFunction,
  AbiParameter,
  Address,
  Hex,
  PublicClient,
} from 'viem'
import {
  decodeAbiParameters,
  encodeAbiParameters,
  getAddress,
  parseAbiItem,
  toFunctionSelector,
} from 'viem'

/**
 * Decodes proposal calldata into human readable function calls.
 *
 * ABIs come from WhatsABI (https://github.com/shazow/whatsabi), which resolves
 * proxies and falls back to guessing an ABI from the bytecode + public
 * signature databases when a contract isn't verified. Only sources that work
 * without an API key are used.
 */

const CHAIN_ID = 1

/** How many levels of nested calldata (e.g. Safe transactions) to decode */
const MAX_DEPTH = 4

export type DecodedArg = {
  name?: string
  type: string
  value: DecodedValue
}

export type DecodedValue =
  /** A leaf value, already formatted for display */
  | { kind: 'value'; value: string }
  /** An array of values */
  | { kind: 'list'; items: DecodedValue[] }
  /** A struct (solidity tuple) */
  | { kind: 'struct'; fields: DecodedArg[] }
  /** Calldata that we were able to decode into one or more nested calls */
  | { kind: 'calls'; raw: Hex; calls: DecodedCall[] }

export type AbiSource =
  /** The ABI of a verified contract */
  | 'verified'
  /** The signature emitted by the governor alongside the proposal */
  | 'proposal'
  /**
   * A public signature database. Selectors are only 4 bytes, so these can
   * collide and produce a wrong (but still valid looking) decoding.
   */
  | 'database'

export type DecodedCall = {
  /** The contract being called, if known */
  target?: Address
  /** The verified contract name, if known */
  contractName?: string
  functionName: string
  /** e.g. `transfer(address,uint256)` */
  signature: string
  args: DecodedArg[]
  /** ETH sent alongside the call, for nested calls that carry a value */
  value?: bigint
  /** Where the ABI used to decode this call came from */
  abiSource: AbiSource
  calldata: Hex
}

type ResolvedContract = {
  name?: string
  functions: AbiFunction[]
  verified: boolean
}

/**
 * A large proposal can reference hundreds of contracts. Looking them all up at
 * once gets us rate limited (and browsers cap parallel requests anyway), which
 * shows up as contracts silently failing to resolve.
 */
const MAX_CONCURRENT_LOOKUPS = 4

/** How many times to retry a contract lookup that failed partway through */
const MAX_LOOKUP_ATTEMPTS = 3
const RETRY_DELAY_MS = 250

const contractCache = new Map<string, Promise<ResolvedContract | null>>()
const signatureCache = new Map<Hex, Promise<AbiFunction | null>>()
const waiting: (() => void)[] = []
let inFlight = 0

async function withLimit<T>(fn: () => Promise<T>): Promise<T> {
  if (inFlight >= MAX_CONCURRENT_LOOKUPS) {
    await new Promise<void>((resolve) => waiting.push(resolve))
  }

  inFlight++

  try {
    return await fn()
  } finally {
    inFlight--
    waiting.shift()?.()
  }
}

let whatsabiPromise: ReturnType<typeof loadWhatsabi> | undefined

async function loadWhatsabi() {
  const mod = await import('@shazow/whatsabi')
  return mod.whatsabi
}

/**
 * WhatsABI is only needed when somebody opens the executable code of a
 * proposal, so it's loaded on demand to keep it out of the main bundle.
 */
function getWhatsabi() {
  if (!whatsabiPromise) whatsabiPromise = loadWhatsabi()
  return whatsabiPromise
}

/** ABI sources that don't require an API key */
async function getAbiLoader() {
  const whatsabi = await getWhatsabi()

  return new whatsabi.loaders.MultiABILoader([
    new whatsabi.loaders.SourcifyABILoader({ chainId: CHAIN_ID }),
    new whatsabi.loaders.AnyABILoader({ chainId: CHAIN_ID }),
  ])
}

/**
 * Loads the ABI of a contract, resolving proxies along the way. Unverified
 * contracts fall back to an ABI guessed from their bytecode.
 *
 * Public RPCs and ABI sources drop requests often enough that a single attempt
 * regularly loses the verified ABI (and with it every param name), so failed
 * lookups are retried and never cached.
 */
function resolveContract(address: Address, client: PublicClient) {
  const key = address.toLowerCase()
  const cached = contractCache.get(key)
  if (cached) return cached

  const promise = withLimit(async (): Promise<ResolvedContract | null> => {
    let contract: ResolvedContract | null = null

    for (let attempt = 1; attempt <= MAX_LOOKUP_ATTEMPTS; attempt++) {
      const result = await loadContract(address, client)
      if (result.complete) return result.contract

      contract = result.contract ?? contract
      await sleep(RETRY_DELAY_MS * attempt)
    }

    // Something upstream is failing. Use whatever we managed to load, but drop
    // it from the cache so the next lookup starts over instead of inheriting a
    // half loaded ABI for the rest of the session.
    contractCache.delete(key)
    return contract
  })

  contractCache.set(key, promise)
  return promise
}

type LoadedContract = {
  contract: ResolvedContract | null
  /** Whether the lookup ran without anything failing along the way */
  complete: boolean
}

async function loadContract(
  address: Address,
  client: PublicClient
): Promise<LoadedContract> {
  try {
    const whatsabi = await getWhatsabi()
    let errored = false

    const result = await whatsabi.autoload(address, {
      provider: client,
      abiLoader: await getAbiLoader(),
      signatureLookup: whatsabi.loaders.defaultSignatureLookup,
      followProxies: true,
      loadContractResult: true,
      // Don't give up on the whole contract because one lookup failed, but
      // remember that this result is missing something
      onError: () => {
        errored = true
        return true
      },
    })

    const verified = !!result.abiLoadedFrom

    return {
      contract: {
        name: result.contractResult?.name ?? undefined,
        // WhatsABI's ABI type is looser than viem's, since functions of
        // unverified contracts can be missing their name and params
        functions: (result.abi as unknown[]).filter(isAbiFunction),
        verified,
      },
      // A contract that simply isn't verified anywhere is a real answer, and
      // retrying it won't produce a better one
      complete: verified || !errored,
    }
  } catch {
    return { contract: null, complete: false }
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Looks up a function signature in public signature databases */
function lookupSignature(selector: Hex) {
  const cached = signatureCache.get(selector)
  if (cached) return cached

  const promise = withLimit(async (): Promise<AbiFunction | null> => {
    try {
      const whatsabi = await getWhatsabi()
      const signatures =
        await whatsabi.loaders.defaultSignatureLookup.loadFunctions(selector)

      for (const signature of signatures) {
        const abiFunction = parseSignature(signature)
        if (abiFunction) return abiFunction
      }

      return null
    } catch {
      signatureCache.delete(selector)
      return null
    }
  })

  signatureCache.set(selector, promise)
  return promise
}

type DecodeParams = {
  target?: Address
  calldata: Hex
  /**
   * Function signature from the `ProposalCreated` event. The ENS governor
   * always emits empty strings here, but other Governor Bravo style contracts
   * put the signature here and omit the selector from the calldata.
   */
  signature?: string
  value?: bigint
  client: PublicClient
  depth?: number
}

/** Decodes a single call, including any calldata nested within it */
export async function decodeCall({
  target,
  calldata,
  signature,
  value,
  client,
  depth = 0,
}: DecodeParams): Promise<DecodedCall | null> {
  try {
    const resolved = await resolveFunction({
      target,
      calldata,
      signature,
      client,
    })

    if (!resolved) return null

    const { abiFunction, params, contract, abiSource } = resolved
    const args = decodeAbiParameters(abiFunction.inputs, params)

    // Selector collisions are a real possibility when the signature came from
    // a database, so make sure the args we decoded account for the calldata
    if (abiSource === 'database' && !reencodesTo(abiFunction, args, params)) {
      return null
    }

    const decodedArgs = await decodeArgs(abiFunction.inputs, args, {
      client,
      depth,
      // Calldata nested in a param is usually meant for a contract passed in
      // as another param, like `Safe.execTransaction(to, value, data, ...)`
      addressHint: args.find(
        (arg, index) => abiFunction.inputs[index]?.type === 'address'
      ) as Address | undefined,
    })

    return {
      target,
      contractName: contract?.name,
      functionName: abiFunction.name,
      signature: formatSignature(abiFunction),
      args: decodedArgs,
      value,
      abiSource,
      calldata,
    }
  } catch {
    return null
  }
}

/** Finds the ABI of the function that a blob of calldata is calling */
async function resolveFunction({
  target,
  calldata,
  signature,
  client,
}: Omit<DecodeParams, 'depth' | 'value'>): Promise<{
  abiFunction: AbiFunction
  params: Hex
  contract: ResolvedContract | null
  abiSource: AbiSource
} | null> {
  // Governor Bravo style proposals pass the signature separately, in which
  // case the calldata is usually only the encoded params
  if (signature) {
    const abiFunction = parseSignature(signature)
    if (!abiFunction) return null

    const params = calldata.startsWith(toFunctionSelector(abiFunction))
      ? (`0x${calldata.slice(10)}` as Hex)
      : calldata

    return { abiFunction, params, contract: null, abiSource: 'proposal' }
  }

  if (calldata.length < 10) return null
  const selector = calldata.slice(0, 10) as Hex
  const params = `0x${calldata.slice(10)}` as Hex

  const contract = target ? await resolveContract(target, client) : null
  const abiFunction = contract && findFunction(contract.functions, selector)

  if (abiFunction) {
    // WhatsABI names functions of unverified contracts by looking their
    // selector up in the same databases we fall back to below
    const abiSource = contract.verified ? 'verified' : 'database'
    return { abiFunction, params, contract, abiSource }
  }

  // The target might not be known (nested calldata) or its ABI might not
  // include this function (unverified proxy, wrong implementation, etc)
  const fromDatabase = await lookupSignature(selector)
  if (!fromDatabase) return null

  return {
    abiFunction: fromDatabase,
    params,
    contract,
    abiSource: 'database',
  }
}

type DecodeContext = {
  client: PublicClient
  depth: number
  /** Contract that calldata nested in these args is likely meant for */
  addressHint?: Address
}

async function decodeArgs(
  inputs: readonly AbiParameter[],
  /** Tuples with named components are decoded into an object by viem */
  values: readonly unknown[] | Record<string, unknown>,
  context: DecodeContext
): Promise<DecodedArg[]> {
  return Promise.all(
    inputs.map(async (input, index) => ({
      name: input.name || undefined,
      type: input.type,
      value: await decodeValue(
        input,
        Array.isArray(values)
          ? values[index]
          : (values as Record<string, unknown>)[input.name ?? index],
        context
      ),
    }))
  )
}

async function decodeValue(
  input: AbiParameter,
  value: unknown,
  context: DecodeContext
): Promise<DecodedValue> {
  const arrayMatch = input.type.match(/^(.*)\[\d*\]$/)

  if (arrayMatch && Array.isArray(value)) {
    const itemInput = { ...input, type: arrayMatch[1] } as AbiParameter

    return {
      kind: 'list',
      items: await Promise.all(
        value.map((item) => decodeValue(itemInput, item, context))
      ),
    }
  }

  if (input.type.startsWith('tuple') && 'components' in input && value) {
    const values = value as Record<string, unknown>

    return {
      kind: 'struct',
      fields: await decodeArgs(input.components, values, context),
    }
  }

  if (input.type === 'bytes' && typeof value === 'string') {
    const calldata = value as Hex
    const calls = await decodeNestedCalldata(calldata, context)
    if (calls) return { kind: 'calls', raw: calldata, calls }
  }

  return { kind: 'value', value: formatValue(value) }
}

/** Decodes calldata that was passed as a param of another call */
async function decodeNestedCalldata(
  calldata: Hex,
  { client, depth, addressHint }: DecodeContext
): Promise<DecodedCall[] | null> {
  if (depth >= MAX_DEPTH || calldata.length < 10) return null

  // Safe batches pack their transactions instead of ABI encoding them
  const batch = unpackMultiSend(calldata)

  if (batch) {
    const calls = await Promise.all(
      batch.map((tx) =>
        decodeCall({
          target: tx.to,
          calldata: tx.data,
          value: tx.value,
          client,
          depth: depth + 1,
        })
      )
    )

    return calls.every((call) => call !== null) ? calls : null
  }

  const call = await decodeCall({
    target: addressHint,
    calldata,
    client,
    depth: depth + 1,
  })

  return call ? [call] : null
}

type MultiSendTransaction = {
  to: Address
  value: bigint
  data: Hex
}

const MULTI_SEND = parseAbiItem('function multiSend(bytes transactions)')
const MULTI_SEND_SELECTOR = toFunctionSelector(MULTI_SEND)

/**
 * Unpacks the transactions of a Safe `MultiSend` call, which are encoded as
 * `operation (1 byte) . to (20 bytes) . value (32 bytes) . length (32 bytes) . data`
 * https://github.com/safe-global/safe-smart-account/blob/main/contracts/libraries/MultiSend.sol
 */
function unpackMultiSend(calldata: Hex): MultiSendTransaction[] | null {
  if (!calldata.startsWith(MULTI_SEND_SELECTOR)) return null

  try {
    const params = `0x${calldata.slice(10)}` as Hex
    const [packed] = decodeAbiParameters(MULTI_SEND.inputs, params)
    const hex = packed.slice(2)
    const transactions: MultiSendTransaction[] = []

    let cursor = 0

    while (cursor < hex.length) {
      // operation (1) + to (20) + value (32) + data length (32), in nibbles
      if (hex.length - cursor < 170) return null

      const to = getAddress(`0x${hex.slice(cursor + 2, cursor + 42)}`)
      const value = BigInt(`0x${hex.slice(cursor + 42, cursor + 106)}`)
      const size = `0x${hex.slice(cursor + 106, cursor + 170)}`
      const length = Number(BigInt(size))
      cursor += 170

      if (hex.length - cursor < length * 2) return null
      const data = `0x${hex.slice(cursor, cursor + length * 2)}` as Hex
      cursor += length * 2

      transactions.push({ to, value, data })
    }

    return transactions.length > 0 ? transactions : null
  } catch {
    return null
  }
}

function isAbiFunction(item: unknown): item is AbiFunction {
  return (
    typeof item === 'object' &&
    item !== null &&
    'type' in item &&
    item.type === 'function' &&
    'name' in item &&
    typeof item.name === 'string' &&
    'inputs' in item &&
    Array.isArray(item.inputs)
  )
}

/**
 * Checks that re-encoding the decoded args reproduces the calldata, which
 * catches signatures that happen to share a selector with the real function.
 */
function reencodesTo(
  abiFunction: AbiFunction,
  args: readonly unknown[],
  params: Hex
) {
  try {
    return encodeAbiParameters(abiFunction.inputs, args) === params
  } catch {
    return false
  }
}

function findFunction(functions: AbiFunction[], selector: Hex) {
  return functions.find((abiFunction) => {
    try {
      return toFunctionSelector(abiFunction) === selector
    } catch {
      return false
    }
  })
}

/** Parses `transfer(address,uint256)` into an ABI item */
function parseSignature(signature: string) {
  try {
    const abiFunction = parseAbiItem(
      signature.startsWith('function ') ? signature : `function ${signature}`
    )

    return abiFunction.type === 'function' ? abiFunction : null
  } catch {
    return null
  }
}

function formatSignature(abiFunction: AbiFunction) {
  const params = abiFunction.inputs.map(formatParamType).join(',')
  return `${abiFunction.name}(${params})`
}

function formatParamType(param: AbiParameter): string {
  if ('components' in param && param.components) {
    const components = param.components.map(formatParamType).join(',')
    return param.type.replace('tuple', `(${components})`)
  }

  return param.type
}

function formatValue(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'bigint' || typeof value === 'number') {
    return value.toString()
  }
  if (typeof value === 'boolean') return String(value)
  if (value === undefined || value === null) return ''
  return JSON.stringify(value, (_, item) =>
    typeof item === 'bigint' ? item.toString() : item
  )
}

/** Etherscan is the closest thing we have to a canonical contract explorer */
export function etherscanAddressUrl(address: Address) {
  return `https://etherscan.io/address/${address}`
}

export function swissKnifeUrl(calldata: Hex, address?: Address) {
  const url = new URL('https://calldata.swiss-knife.xyz/decoder')
  url.searchParams.set('calldata', calldata)
  url.searchParams.set('chainId', String(CHAIN_ID))
  if (address) url.searchParams.set('address', address)
  return url.toString()
}
