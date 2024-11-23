'use client'
import React, { useState } from 'react';
import { Wallet, CircleDollarSign, Users, HelpCircle } from 'lucide-react';

const HomePage = () => {
  const [expenseAmount, setExpenseAmount] = useState('45.23');
  const [splitAddress, setSplitAddress] = useState('');
  
  return (
    <div className="min-h-screen bg-white p-8">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12">
        <div className="flex items-center space-x-2">
          <span className="text-purple-600 font-bold text-2xl">Sol</span>
          <span className="font-bold text-2xl">Split</span>
        </div>
        
        <nav className="flex items-center space-x-8">
          <a href="#" className="text-gray-700">Dashboard</a>
          <a href="#" className="text-gray-700">Logbook</a>
          <a href="#" className="text-gray-700">Groups</a>
          <a href="#" className="text-gray-700">Settle Up</a>
          <button className="p-2 bg-gray-100 rounded-full">
            <HelpCircle className="w-5 h-5 text-gray-600" />
          </button>
          <div className="w-10 h-10 rounded-full bg-gray-200" />
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto flex gap-8">
        {/* Left Column - Expense Form */}
        <div className="flex-1">
          <h1 className="text-3xl font-semibold mb-2">Good morning, Adicheeky</h1>
          <p className="text-gray-500 mb-8">11 September, 2024</p>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="mb-8">
              <label className="block text-sm text-gray-500 mb-2">Expense Amount</label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="text-4xl font-semibold w-48 focus:outline-none"
                />
                <span className="text-4xl font-semibold ml-2">Sol</span>
                <button className="ml-auto p-2 text-gray-400 hover:text-gray-600">
                  <Wallet className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm text-gray-500 mb-2">Expense Description</label>
              <div className="space-y-3">
                <div className="flex items-center border rounded-lg p-3">
                  <input
                    type="text"
                    placeholder="Wallet Address 1"
                    value={splitAddress}
                    onChange={(e) => setSplitAddress(e.target.value)}
                    className="flex-1 focus:outline-none"
                  />
                  <span className="text-gray-400">50%</span>
                </div>
                <button className="flex items-center text-gray-400 hover:text-gray-600 p-3">
                  <span className="mr-2">Add Splitee</span>
                </button>
              </div>
            </div>

            <button className="w-full bg-green-400 text-white rounded-full py-3 flex items-center justify-center">
              <span className="mr-2">Add Payment</span>
              <span className="text-2xl">+</span>
            </button>
          </div>
        </div>

        {/* Right Column - Quick Actions */}
        <div className="w-64 space-y-4">
          <div className="bg-orange-50 p-6 rounded-xl">
            <div className="flex items-center mb-4">
              <CircleDollarSign className="w-6 h-6 text-orange-400" />
            </div>
            <h3 className="font-medium mb-1">Open Logbook</h3>
          </div>

          <div className="bg-blue-50 p-6 rounded-xl">
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="font-medium mb-1">Groups</h3>
          </div>

          <div className="bg-red-50 p-6 rounded-xl">
            <div className="flex items-center mb-4">
              <CircleDollarSign className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="font-medium mb-1">Settle Up</h3>
            <p className="text-xl font-semibold">$200.50</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;