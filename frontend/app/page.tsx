// app/page.tsx
"use client";

import CreateGroup from "./components/CreateGroup";
import { WalletButton } from "./components/WalletButton";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            SolSplit: Split Expenses on Solana
          </h1>
          <p className="text-lg text-gray-600">
            Create groups, split expenses, and settle debts easily on the Solana
            blockchain
          </p>
        </div>

        <div className="flex justify-end mb-8">
          <WalletButton />
        </div>

        <CreateGroup />
      </div>
    </main>
  );
}
