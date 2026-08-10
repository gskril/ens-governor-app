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
  target: Address
  calldata: Hex
  value: bigint
  signature?: string
}

function ProposalAction({ target, calldata, value, signature }: ActionProps) {
  const { data: call, isPending } = useDecodedCalldata({
    target,
    calldata,
    signature,
  })

  return (
    <div className="text-sm">
      <div className="max-w-full break-all rounded-md bg-muted p-4 font-mono">
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-6">
          <div>target:</div>
          <div>
            {target}
            {call?.contractName && (
              <span className="text-zinc-500"> ({call.contractName})</span>
            )}
          </div>

          {isPending && (
            <>
              <div>function:</div>
              <div className="flex items-center gap-1.5 text-zinc-500">
                <Loader2 className="size-3 animate-spin" />
                Decoding
              </div>
            </>
          )}

          {!isPending && call && (
            <>
              <div>function:</div>
              <div>
                <CallView call={call} />
              </div>
            </>
          )}

          {/* Fall back to the raw calldata when we can't decode it */}
          {!isPending && !call && (
            <>
              <div>calldata:</div>
              <div>{calldata}</div>
            </>
          )}

          <div>value:</div>
          <div>
            {value.toString()}
            {value > BigInt(0) && (
              <span className="text-zinc-500"> ({formatEther(value)} ETH)</span>
            )}
          </div>

          {signature && (
            <>
              <div>signature:</div>
              <div>{signature}</div>
            </>
          )}
        </div>

        {call && (
          <Details summary="Raw calldata">
            <div className="text-zinc-600">{calldata}</div>
          </Details>
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
    <div className="leading-relaxed">
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
        <div
          key={index}
          className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded border bg-background p-2"
        >
          <div className="text-zinc-500">target:</div>
          <div>
            {call.target ? (
              <a
                href={etherscanAddressUrl(call.target)}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-dotted underline-offset-2"
              >
                {call.target}
              </a>
            ) : (
              <span className="text-zinc-500">unknown</span>
            )}
            {call.contractName && (
              <span className="text-zinc-500"> ({call.contractName})</span>
            )}
          </div>

          <div className="text-zinc-500">function:</div>
          <div>
            <CallView call={call} />
          </div>

          {!!call.value && call.value > BigInt(0) && (
            <>
              <div className="text-zinc-500">value:</div>
              <div>
                {call.value.toString()}
                <span className="text-zinc-500">
                  {' '}
                  ({formatEther(call.value)} ETH)
                </span>
              </div>
            </>
          )}
        </div>
      ))}

      <Details summary="Raw bytes">
        <div className="text-zinc-600">{raw}</div>
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

function Indented({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-1 ml-1 flex flex-col gap-1.5 border-l border-zinc-300 pl-3">
      {children}
    </div>
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
