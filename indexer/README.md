# Indexer

This is a [Ponder](https://ponder.sh) project that indexes events from the [governor.ensdao.eth](https://etherscan.io/address/0x323A76393544d5ecca80cd6ef2A560C6a395b7E3) smart contract.

## Endpoints

- `/` - GraphQL playground
- `/proposals` - List of the 50 latest DAO proposals
- `/proposals/:id` - Details for a specific proposal, including all votes

## Local development

Clone this repo and install dependencies from the root directory:

```bash
pnpm install
```

Navigate to the `indexer` directory and set up your environment variables:

```bash
cd indexer
cp .env.example .env.local
```

Run the dev server:

```bash
pnpm dev
```

Open [http://localhost:42069](http://localhost:42069) in your browser and navigate to one of the endpoints listed above.
