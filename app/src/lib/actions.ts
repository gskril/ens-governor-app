'use server'

import { revalidatePath } from 'next/cache'

export default async function revalidateProposal(id: string) {
  revalidatePath(`/proposal/${id}`)
}
