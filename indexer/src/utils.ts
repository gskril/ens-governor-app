import { Hex } from 'viem'

export function arrayToJsonb(
  array: readonly string[] | readonly Hex[] | readonly bigint[]
): string[] {
  return array.map((value) => value.toString())
}
