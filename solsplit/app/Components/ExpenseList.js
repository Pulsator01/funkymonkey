import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const dummyExpenses = [
  {
    id: 1,
    description: "Dinner",
    amount: 100,
    paidBy: "Alice",
    date: "2023-05-01",
  },
  {
    id: 2,
    description: "Movie tickets",
    amount: 50,
    paidBy: "Bob",
    date: "2023-05-02",
  },
  {
    id: 3,
    description: "Groceries",
    amount: 75,
    paidBy: "Charlie",
    date: "2023-05-03",
  },
];

export function ExpenseList() {
  return (
    <div className="space-y-4">
      {dummyExpenses.map((expense) => (
        <Card key={expense.id} className="bg-gray-800 border-gray-700">
          <CardContent className="flex justify-between items-center p-4">
            <div>
              <h3 className="font-semibold text-gray-100">
                {expense.description}
              </h3>
              <p className="text-sm text-gray-400">
                Paid by {expense.paidBy} on {expense.date}
              </p>
            </div>
            <Badge
              variant="secondary"
              className="text-lg bg-blue-600 text-gray-100"
            >
              {expense.amount} SOL
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
