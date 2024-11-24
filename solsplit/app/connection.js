import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program } from "@project-serum/anchor";

import idl from "./solsplit.json";
// Replace with your deployed program ID
const PROGRAM_ID = new PublicKey(
  "BRHKjMLrVzVaE1aCkS6heDtVzHesQXbEuBwMYZnhVVKB",
);

// Use the local validator URL instead of devnet
const NETWORK = "http://127.0.0.1:8899"; // Local Solana Test Validator

const connection = new Connection(NETWORK, "processed");

// Set up the provider with your wallet (assumes Phantom wallet)
const provider = new AnchorProvider(
  connection,
  window.solana, // This assumes you're using Phantom Wallet
  AnchorProvider.defaultOptions(),
);

const program = new Program(idl, PROGRAM_ID, provider);

export { connection, program };

connection.js