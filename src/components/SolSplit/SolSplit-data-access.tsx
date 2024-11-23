'use client'

import {getSolSplitProgram, getSolSplitProgramId} from '@project/anchor'
import {useConnection} from '@solana/wallet-adapter-react'
import {Cluster, Keypair, PublicKey} from '@solana/web3.js'
import {useMutation, useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'
import toast from 'react-hot-toast'
import {useCluster} from '../cluster/cluster-data-access'
import {useAnchorProvider} from '../solana/solana-provider'
import {useTransactionToast} from '../ui/ui-layout'

export function useSolSplitProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getSolSplitProgramId(cluster.network as Cluster), [cluster])
  const program = getSolSplitProgram(provider)

  const accounts = useQuery({
    queryKey: ['SolSplit', 'all', { cluster }],
    queryFn: () => program.account.SolSplit.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['SolSplit', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ SolSplit: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

export function useSolSplitProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useSolSplitProgram()

  const accountQuery = useQuery({
    queryKey: ['SolSplit', 'fetch', { cluster, account }],
    queryFn: () => program.account.SolSplit.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['SolSplit', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ SolSplit: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['SolSplit', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ SolSplit: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['SolSplit', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ SolSplit: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['SolSplit', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ SolSplit: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}
