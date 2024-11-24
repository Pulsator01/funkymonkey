"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export function AddExpenseForm() {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically interact with the Solana blockchain
    console.log("Submitting expense:", { description, amount });
    // Reset form
    setDescription("");
    setAmount("");
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-4">
          <div>
            <Label htmlFor="description" className="text-gray-100">
              Description
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter expense description"
              required
              className="bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-400"
            />
          </div>
          <div>
            <Label htmlFor="amount" className="text-gray-100">
              Amount (SOL)
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount in SOL"
              required
              min="0"
              step="0.01"
              className="bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-400"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-gray-100"
          >
            Add Expense
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
