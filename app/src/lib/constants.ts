export const BASE_URL = 'https://dao.ens.gregskril.com'

// Base URL of the Ponder indexer API. We poll its `/ready` endpoint so the
// frontend can warn users when the indexer is falling behind.
export const PONDER_URL = process.env.NEXT_PUBLIC_PONDER_URL
