"use client";

import React, { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider, web3 } from "@project-serum/anchor";

export default function Page() {
  // State management
  const [groupName, setGroupName] = useState("");
  const [memberAddress, setMemberAddress] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [payerAddress, setPayerAddress] = useState("");
  const [currentGroup, setCurrentGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { connection } = useConnection();
  const wallet = useWallet();

  // Initialize the program
  const getProgram = () => {
    if (!wallet.connected) return null;
    const provider = new AnchorProvider(connection, wallet, {});
    const programId = new PublicKey(
      "ATXoGc1EmZjV7pgwzuHDwy98yHiMeu4SWEMBWyEKc7xi",
    );
    return new Program(idl, programId, provider);
  };

  const initializeGroup = async (e) => {
    e.preventDefault();
    if (!wallet.connected) {
      setError("Please connect your wallet first");
      return;
    }

    setLoading(true);
    try {
      const program = getProgram();
      const [groupPDA] = await PublicKey.findProgramAddress(
        [Buffer.from("group"), wallet.publicKey.toBuffer()],
        program.programId,
      );

      await program.methods
        .initialize(groupName)
        .accounts({
          group: groupPDA,
          owner: wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      setGroupName("");
      setCurrentGroup({
        publicKey: groupPDA,
        name: groupName,
        members: [],
        balances: [],
      });
    } catch (err) {
      setError(`Failed to create group: ${err.message}`);
    }
    setLoading(false);
  };

  const addMember = async (e) => {
    e.preventDefault();
    if (!currentGroup || !memberAddress) return;

    setLoading(true);
    try {
      const program = getProgram();
      const memberPubkey = new PublicKey(memberAddress);

      await program.methods
        .addMember(memberPubkey)
        .accounts({
          group: currentGroup.publicKey,
          owner: wallet.publicKey,
        })
        .rpc();

      setMemberAddress("");
      setCurrentGroup((prev) => ({
        ...prev,
        members: [...prev.members, memberPubkey],
      }));
    } catch (err) {
      setError(`Failed to add member: ${err.message}`);
    }
    setLoading(false);
  };

  const addExpense = async (e) => {
    e.preventDefault();
    if (!currentGroup || !expenseAmount || !payerAddress) return;

    setLoading(true);
    try {
      const program = getProgram();
      const payerPubkey = new PublicKey(payerAddress);
      const amount = new web3.BN(
        parseFloat(expenseAmount) * web3.LAMPORTS_PER_SOL,
      );

      await program.methods
        .addExpense(amount, payerPubkey)
        .accounts({
          group: currentGroup.publicKey,
          owner: wallet.publicKey,
        })
        .rpc();

      setExpenseAmount("");
      setPayerAddress("");
      const groupAccount = await program.account.group.fetch(
        currentGroup.publicKey,
      );
      setCurrentGroup((prev) => ({
        ...prev,
        ...groupAccount,
      }));
    } catch (err) {
      setError(`Failed to add expense: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Create Group Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Create New Group</h2>
          <form onSubmit={initializeGroup} className="space-y-4">
            <input
              type="text"
              placeholder="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <button
              type="submit"
              disabled={loading || !wallet.connected}
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
            >
              Create Group
            </button>
          </form>
        </div>

        {/* Group Management */}
        {currentGroup && (
          <>
            {/* Add Member Form */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Add Member</h2>
              <form onSubmit={addMember} className="space-y-4">
                <input
                  type="text"
                  placeholder="Member Wallet Address"
                  value={memberAddress}
                  onChange={(e) => setMemberAddress(e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-gray-300"
                >
                  Add Member
                </button>
              </form>
            </div>

            {/* Add Expense Form */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Add Expense</h2>
              <form onSubmit={addExpense} className="space-y-4">
                <input
                  type="number"
                  step="0.000000001"
                  placeholder="Amount in SOL"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Payer Wallet Address"
                  value={payerAddress}
                  onChange={(e) => setPayerAddress(e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-500 text-white p-2 rounded hover:bg-purple-600 disabled:bg-gray-300"
                >
                  Add Expense
                </button>
              </form>
            </div>

            {/* Group Details */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Group Details</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Members</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    {currentGroup.members?.map((member, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        {member.toString()}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Balances</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    {currentGroup.balances?.map((balance, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        {balance.payer.toString()} owes{" "}
                        {balance.payee.toString()}{" "}
                        {(balance.amount / web3.LAMPORTS_PER_SOL).toFixed(9)}{" "}
                        SOL
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
