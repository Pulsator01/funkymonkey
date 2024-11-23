'use client';

import React, { useState } from 'react';
import { Wallet, CircleDollarSign, Users } from 'lucide-react';

const HomePage = () => {
  const [expenseAmount, setExpenseAmount] = useState('45.23');
  const [splitAddress, setSplitAddress] = useState('');
  
  return (
    <div className="container max-w-4xl mx-auto py-8">
      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Expense Form */}
        <div className="md:col-span-2">
          <h1 className="text-3xl font-semibold mb-2">Good morning, Adicheeky</h1>
          <p className="text-base-content/60 mb-8">11 September, 2024</p>
          
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <div className="mb-8">
                <label className="label">
                  <span className="label-text">Expense Amount</span>
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    className="input input-ghost text-4xl font-semibold w-48"
                  />
                  <span className="text-4xl font-semibold ml-2">Sol</span>
                  <button className="btn btn-ghost btn-circle ml-auto">
                    <Wallet className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="mb-8">
                <label className="label">
                  <span className="label-text">Expense Description</span>
                </label>
                <div className="space-y-3">
                  <div className="flex items-center border rounded-lg p-3">
                    <input
                      type="text"
                      placeholder="Wallet Address 1"
                      value={splitAddress}
                      onChange={(e) => setSplitAddress(e.target.value)}
                      className="input input-ghost flex-1"
                    />
                    <span className="text-base-content/60">50%</span>
                  </div>
                  <button className="btn btn-ghost btn-block justify-start">
                    Add Splitee
                  </button>
                </div>
              </div>

              <button className="btn btn-success btn-block rounded-full">
                <span className="mr-2">Add Payment</span>
                <span className="text-2xl">+</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Quick Actions */}
        <div className="space-y-4">
          <div className="card bg-warning/10">
            <div className="card-body">
              <div className="mb-2">
                <CircleDollarSign className="w-6 h-6 text-warning" />
              </div>
              <h3 className="card-title text-base">Open Logbook</h3>
            </div>
          </div>

          <div className="card bg-info/10">
            <div className="card-body">
              <div className="mb-2">
                <Users className="w-6 h-6 text-info" />
              </div>
              <h3 className="card-title text-base">Groups</h3>
            </div>
          </div>

          <div className="card bg-error/10">
            <div className="card-body">
              <div className="mb-2">
                <CircleDollarSign className="w-6 h-6 text-error" />
              </div>
              <h3 className="card-title text-base">Settle Up</h3>
              <p className="text-xl font-semibold">$200.50</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;