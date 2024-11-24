import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SolSplit - Split Expenses on Solana",
  description: "A Splitwise clone built on the Solana blockchain",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={${inter.className} dark bg-gray-900 text-gray-100}>
        {children}
      </body>
    </html>
  );
}