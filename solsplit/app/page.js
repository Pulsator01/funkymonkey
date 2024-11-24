"use client";

import { Navbar } from "./components/Navbar";
import { ExpenseList } from "./components/ExpenseList";
import { AddExpenseForm } from "./components/AddExpenseForm";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { program } from "./connection";
import { useState } from "react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react"; // Assuming you're using a wallet adapter like Phantom

export default function Home() {
  const { publicKey, connected } = useWallet();
  const [groupId, setGroupId] = useState(null);
  const [expenseAmount, setExpenseAmount] = useState(0);
  const [expenseDescription, setExpenseDescription] = useState("");
  const [error, setError] = useState("");

  // Function to create a new group
  const createGroup = async (name) => {
    try {
      const tx = await program.methods
        .createGroup(name)
        .accounts({
          user: publicKey,
          group: groupId || PublicKey.default, // Using the current groupId or default value for new group
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      console.log("Group created successfully:", tx);
    } catch (err) {
      setError("Error creating group: " + err.message);
    }
  };

  // Function to add an expense to a group
  const addExpense = async () => {
    if (!groupId) {
      setError("Group ID is required to add an expense.");
      return;
    }

    try {
      const tx = await program.methods
        .addExpense(groupId, expenseAmount, expenseDescription)
        .accounts({
          user: publicKey,
          group: groupId,
          expense: PublicKey.default, // This should be an account associated with the expense
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      console.log("Expense added successfully:", tx);
    } catch (err) {
      setError("Error adding expense: " + err.message);
    }
  };

  // Function to get the share for each member
  const getShare = async () => {
    if (!groupId) {
      setError("Group ID is required to get share.");
      return;
    }

    try {
      const share = await program.methods
        .getShare(groupId)
        .accounts({ group: groupId })
        .rpc();
      console.log("Share per member:", share);
    } catch (err) {
      setError("Error fetching share: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-100">
              Recent Expenses
            </h2>
            <ExpenseList />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-100">
              Add New Expense
            </h2>
            <AddExpenseForm
              onAddExpense={addExpense}
              expenseAmount={expenseAmount}
              setExpenseAmount={setExpenseAmount}
              expenseDescription={expenseDescription}
              setExpenseDescription={setExpenseDescription}
            />
            <div className="mt-4">
              <Button onClick={() => createGroup("New Group")}>
                Create Group
              </Button>
              <Button className="ml-4" onClick={getShare}>
                Get Share
              </Button>
            </div>
          </div>
        </div>
        {error && <div className="text-red-500 mt-4">{error}</div>}
      </main>
    </div>
  );
}