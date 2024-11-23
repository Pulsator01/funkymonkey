// app/hooks/useSolsplit.ts
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, web3, utils } from "@project-serum/anchor";
import { useCallback, useMemo } from "react";
import { PublicKey } from "@solana/web3.js";
import idl from "../idl.json";

const programId = new PublicKey("6gUK82V42pHmTu7f3utXbZoiGzx3bZPpfx2HY65k78w7");

export const useSolsplit = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const program = useMemo(() => {
    if (!publicKey) return null;

    try {
      const provider = new AnchorProvider(
        connection,
        {
          publicKey,
          signTransaction:
            window.solana?.signTransaction ||
            (async () => {
              throw new Error("Wallet not connected");
            }),
          signAllTransactions:
            window.solana?.signAllTransactions ||
            (async () => {
              throw new Error("Wallet not connected");
            }),
        },
        { commitment: "confirmed" },
      );

      console.log("Initializing Program...");
      console.log("IDL:", idl);
      console.log("Program ID:", programId.toString());
      console.log("Provider:", provider);

      return new Program(idl, programId, provider);
    } catch (error) {
      console.error("Error initializing Program:", error);
      return null;
    }
  }, [connection, publicKey]);

  const createGroup = useCallback(
    async (name: string) => {
      if (!program || !publicKey) return;

      const [groupPda] = PublicKey.findProgramAddressSync(
        [utils.bytes.utf8.encode("group"), publicKey.toBuffer()],
        programId,
      );

      try {
        await program.methods
          .initialize(name)
          .accounts({
            group: groupPda,
            owner: publicKey,
            systemProgram: web3.SystemProgram.programId,
          })
          .rpc();
        return groupPda;
      } catch (error) {
        console.error("Error creating group:", error);
        throw error;
      }
    },
    [program, publicKey],
  );

  const addMember = useCallback(
    async (
      groupAddress: PublicKey,
      memberPubkey: PublicKey,
      nickname: string,
    ) => {
      if (!program || !publicKey) return;

      try {
        await program.methods
          .addMember(memberPubkey, nickname)
          .accounts({
            group: groupAddress,
            owner: publicKey,
          })
          .rpc();
      } catch (error) {
        console.error("Error adding member:", error);
        throw error;
      }
    },
    [program, publicKey],
  );

  const addExpense = useCallback(
    async (
      groupAddress: PublicKey,
      amount: number,
      description: string,
      payer: PublicKey,
      splitType: "Equal" | "Custom" | "Percentage",
      customSplits?: { member: PublicKey; amount: number }[],
    ) => {
      if (!program || !publicKey) return;

      try {
        const splitTypeObj =
          splitType === "Equal"
            ? { equal: {} }
            : splitType === "Custom"
              ? { custom: {} }
              : splitType === "Percentage"
                ? { percentage: {} }
                : {};
        await program.methods
          .addExpense(
            new web3.BN(amount),
            description,
            payer,
            splitTypeObj,
            customSplits,
          )
          .accounts({
            group: groupAddress,
            owner: publicKey,
          })
          .rpc();
      } catch (error) {
        console.error("Error adding expense:", error);
        throw error;
      }
    },
    [program, publicKey],
  );

  const settleDebt = useCallback(
    async (
      groupAddress: PublicKey,
      amount: number,
      payer: PublicKey,
      payee: PublicKey,
    ) => {
      if (!program || !publicKey) return;

      try {
        await program.methods
          .settleDebt(new web3.BN(amount), payer, payee)
          .accounts({
            group: groupAddress,
            signer: publicKey,
          })
          .rpc();
      } catch (error) {
        console.error("Error settling debt:", error);
        throw error;
      }
    },
    [program, publicKey],
  );

  return {
    createGroup,
    addMember,
    addExpense,
    settleDebt,
    program,
    publicKey,
  };
};
