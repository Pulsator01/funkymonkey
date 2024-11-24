import { Button } from "@/components/ui/button";
import { WalletIcon } from "lucide-react";

export function Navbar() {
  return (
    <nav className="bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-400">SolSplit</div>
        <Button
          variant="outline"
          className="text-gray-100 border-gray-100 hover:bg-gray-700"
        >
          <WalletIcon className="mr-2 h-4 w-4" /> Connect Wallet
        </Button>
      </div>
    </nav>
  );
}
