'use client'

import { EnhancedProposalWithVotes } from 'indexer/types'
import { Loader2 } from 'lucide-react'
import { Address, Hex, formatEther, isAddress } from 'viem'

import { buttonVariants } from '@/components/ui/button'
import { useDecodedCalldata } from '@/hooks/useDecodedCalldata'
import {
  DecodedArg,
  DecodedCall,
  DecodedValue,
  etherscanAddressUrl,
  swissKnifeUrl,
} from '@/lib/decode'
import { truncateAddress } from '@/lib/utils'

/** Batches longer than this are collapsed to keep the page scannable */
const COLLAPSE_BATCH_AT = 4

type Props = {
  proposal: EnhancedProposalWithVotes
}

export function ProposalCalldata({ proposal }: Props) {
  return (
    <div className="flex flex-col gap-6 py-2">
      {proposal.targets.map((target, index) => (
        <ProposalAction
          key={index}
          index={index}
          total={proposal.targets.length}
          target={target}
          calldata={proposal.calldatas[index]}
          value={BigInt(proposal.values[index] ?? 0)}
          signature={proposal.signatures[index] || undefined}
        />
      ))}
    </div>
  )
}

type ActionProps = {
  index: number
  total: number
  target: Address
  calldata: Hex
  value: bigint
  signature?: string
}

function ProposalAction({
  index,
  total,
  target,
  calldata,
  value,
  signature,
}: ActionProps) {
  const { data: call, isPending } = useDecodedCalldata({
    target,
    calldata,
    signature,
  })

  return (
    <div className="text-sm">
      <div className="max-w-full rounded-md bg-muted p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <div className="flex items-center gap-2">
            {total > 1 && <span className="text-zinc-500">{index + 1}.</span>}
            <ContractLabel address={target} name={call?.contractName} />
          </div>

          {isPending && (
            <span className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Loader2 className="size-3 animate-spin" />
              Decoding
            </span>
          )}
        </div>

        {call ? <CallView call={call} /> : <Code>{calldata}</Code>}

        {value > BigInt(0) && (
          <div className="mt-3 font-mono text-xs">
            <span className="text-zinc-500">value: </span>
            {formatEther(value)} ETH
          </div>
        )}

        {call ? (
          <Details summary="Raw calldata">
            <Code>{calldata}</Code>
          </Details>
        ) : (
          !isPending && (
            <p className="mt-3 text-xs text-zinc-500">
              This calldata couldn&apos;t be decoded automatically. Try one of
              the tools below.
            </p>
          )
        )}
      </div>

      <div className="mt-2 flex justify-end gap-2">
        <a
          href={etherscanAddressUrl(target)}
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({ size: 'xs' })}
        >
          View Contract
        </a>

        <a
          href={swissKnifeUrl(calldata, target)}
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({ size: 'xs' })}
        >
          Decode Calldata
        </a>
      </div>
    </div>
  )
}

function CallView({ call }: { call: DecodedCall }) {
  return (
    <div className="break-all font-mono text-xs leading-relaxed">
      <div>
        <span className="font-semibold text-primary-brand">
          {call.functionName}
        </span>
        <span className="text-zinc-500">({call.args.length === 0 && ')'}</span>
      </div>

      {call.args.length > 0 && (
        <>
          <Indented>
            {call.args.map((arg, index) => (
              <ArgView key={index} arg={arg} index={index} />
            ))}
          </Indented>

          <span className="text-zinc-500">)</span>
        </>
      )}
    </div>
  )
}

function ArgView({ arg, index }: { arg: DecodedArg; index: number }) {
  const isBlock = arg.value.kind !== 'value'

  return (
    <div>
      <span className="text-zinc-500">{arg.type} </span>
      <span className="font-medium">{arg.name ?? `arg${index}`}</span>
      <span className="text-zinc-500">{isBlock ? ':' : ' = '}</span>
      {isBlock ? (
        <div className="mt-1">
          <ValueView value={arg.value} />
        </div>
      ) : (
        <ValueView value={arg.value} />
      )}
    </div>
  )
}

function ValueView({ value }: { value: DecodedValue }) {
  if (value.kind === 'value') {
    if (isAddress(value.value, { strict: false })) {
      return (
        <a
          href={etherscanAddressUrl(value.value)}
          target="_blank"
          rel="noreferrer"
          className="underline decoration-dotted underline-offset-2"
        >
          {value.value}
        </a>
      )
    }

    return <span>{value.value || '""'}</span>
  }

  if (value.kind === 'list') {
    if (value.items.length === 0) {
      return <span className="text-zinc-500">[]</span>
    }

    return (
      <Indented>
        {value.items.map((item, index) => (
          <div key={index}>
            <span className="text-zinc-500">{index}: </span>
            <ValueView value={item} />
          </div>
        ))}
      </Indented>
    )
  }

  if (value.kind === 'struct') {
    return (
      <Indented>
        {value.fields.map((field, index) => (
          <ArgView key={index} arg={field} index={index} />
        ))}
      </Indented>
    )
  }

  return <NestedCalls calls={value.calls} raw={value.raw} />
}

/** Calldata that was passed as a param of another call */
function NestedCalls({ calls, raw }: { calls: DecodedCall[]; raw: Hex }) {
  const content = (
    <div className="flex flex-col gap-2">
      {calls.map((call, index) => (
        <div key={index} className="rounded border bg-background p-2">
          <div className="mb-1.5 flex flex-wrap items-center gap-x-3">
            <ContractLabel address={call.target} name={call.contractName} />

            {!!call.value && call.value > BigInt(0) && (
              <span className="text-xs text-zinc-500">
                {formatEther(call.value)} ETH
              </span>
            )}
          </div>

          <CallView call={call} />
        </div>
      ))}

      <Details summary="Raw bytes">
        <Code>{raw}</Code>
      </Details>
    </div>
  )

  if (calls.length > COLLAPSE_BATCH_AT) {
    return (
      <Details summary={`Batch of ${calls.length} calls`} className="mt-0">
        {content}
      </Details>
    )
  }

  return content
}

function ContractLabel({
  address,
  name,
}: {
  address?: Address
  name?: string
}) {
  if (!address) {
    return <span className="text-sm text-zinc-500">Unknown contract</span>
  }

  return (
    <a
      href={etherscanAddressUrl(address)}
      target="_blank"
      rel="noreferrer"
      title={address}
      className="flex flex-wrap items-baseline gap-x-1.5 hover:underline"
    >
      {name && <span className="font-semibold">{name}</span>}
      <span className="break-all font-mono text-xs text-zinc-500">
        {name ? truncateAddress(address) : address}
      </span>
    </a>
  )
}

function Indented({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-1 ml-1 flex flex-col gap-1.5 border-l border-zinc-300 pl-3">
      {children}
    </div>
  )
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <div className="break-all font-mono text-xs text-zinc-600">{children}</div>
  )
}

function Details({
  summary,
  className,
  children,
}: {
  summary: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <details className={className ?? 'mt-3'}>
      <summary className="w-fit cursor-pointer select-none text-xs text-zinc-500">
        {summary}
      </summary>
      <div className="mt-2">{children}</div>
    </details>
  )
}
