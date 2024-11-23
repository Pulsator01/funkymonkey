// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import SolSplitIDL from '../target/idl/SolSplit.json'
import type { SolSplit } from '../target/types/SolSplit'

// Re-export the generated IDL and type
export { SolSplit, SolSplitIDL }

// The programId is imported from the program IDL.
export const SOL_SPLIT_PROGRAM_ID = new PublicKey(SolSplitIDL.address)

// This is a helper function to get the SolSplit Anchor program.
export function getSolSplitProgram(provider: AnchorProvider) {
  return new Program(SolSplitIDL as SolSplit, provider)
}

// This is a helper function to get the program ID for the SolSplit program depending on the cluster.
export function getSolSplitProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the SolSplit program on devnet and testnet.
      return new PublicKey('CounNZdmsQmWh7uVngV9FXW2dZ6zAgbJyYsvBpqbykg')
    case 'mainnet-beta':
    default:
      return SOL_SPLIT_PROGRAM_ID
  }
}
