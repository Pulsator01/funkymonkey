import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {SolSplit} from '../target/types/SolSplit'

describe('SolSplit', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.SolSplit as Program<SolSplit>

  const SolSplitKeypair = Keypair.generate()

  it('Initialize SolSplit', async () => {
    await program.methods
      .initialize()
      .accounts({
        SolSplit: SolSplitKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([SolSplitKeypair])
      .rpc()

    const currentCount = await program.account.SolSplit.fetch(SolSplitKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment SolSplit', async () => {
    await program.methods.increment().accounts({ SolSplit: SolSplitKeypair.publicKey }).rpc()

    const currentCount = await program.account.SolSplit.fetch(SolSplitKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment SolSplit Again', async () => {
    await program.methods.increment().accounts({ SolSplit: SolSplitKeypair.publicKey }).rpc()

    const currentCount = await program.account.SolSplit.fetch(SolSplitKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement SolSplit', async () => {
    await program.methods.decrement().accounts({ SolSplit: SolSplitKeypair.publicKey }).rpc()

    const currentCount = await program.account.SolSplit.fetch(SolSplitKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set SolSplit value', async () => {
    await program.methods.set(42).accounts({ SolSplit: SolSplitKeypair.publicKey }).rpc()

    const currentCount = await program.account.SolSplit.fetch(SolSplitKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the SolSplit account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        SolSplit: SolSplitKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.SolSplit.fetchNullable(SolSplitKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
