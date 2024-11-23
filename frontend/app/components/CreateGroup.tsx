// app/components/CreateGroup.tsx
"use client";

import { useState } from "react";
import { useSolsplit } from "../hooks/useSolsplit";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "./WalletButton";

export default function CreateGroup() {
  const [groupName, setGroupName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { createGroup } = useSolsplit();
  const { connected } = useWallet();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    setIsLoading(true);
    try {
      const groupAddress = await createGroup(groupName);
      console.log("Group created:", groupAddress.toString());
      setGroupName("");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Create Expense Group
      </h2>

      {!connected ? (
        <div className="text-center">
          <WalletButton />
          <p className="mt-4 text-gray-600">
            Connect your wallet to create a group
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="groupName"
              className="block text-sm font-medium text-gray-700"
            >
              Group Name
            </label>
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter group name"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !groupName.trim()}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Creating..." : "Create Group"}
          </button>
        </form>
      )}
    </div>
  );
}
