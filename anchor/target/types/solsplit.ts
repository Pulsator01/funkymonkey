/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/solsplit.json`.
 */
export type Solsplit = {
  "address": "AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ",
  "metadata": {
    "name": "solsplit",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "addExpense",
      "discriminator": [
        171,
        23,
        8,
        240,
        62,
        31,
        254,
        144
      ],
      "accounts": [
        {
          "name": "split",
          "writable": true
        },
        {
          "name": "owner",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "participants",
          "type": {
            "vec": "pubkey"
          }
        }
      ]
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "split",
          "writable": true,
          "signer": true
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        }
      ]
    },
    {
      "name": "settle",
      "discriminator": [
        175,
        42,
        185,
        87,
        144,
        131,
        102,
        212
      ],
      "accounts": [
        {
          "name": "split",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "participant",
          "type": "pubkey"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "split",
      "discriminator": [
        166,
        254,
        141,
        46,
        23,
        221,
        129,
        195
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "noOutstandingBalance",
      "msg": "No outstanding balance with the specified participant."
    },
    {
      "code": 6001,
      "name": "nameTooLong",
      "msg": "Name must be 32 characters or less."
    },
    {
      "code": 6002,
      "name": "descriptionTooLong",
      "msg": "Description must be 32 characters or less."
    },
    {
      "code": 6003,
      "name": "noParticipants",
      "msg": "No participants provided."
    },
    {
      "code": 6004,
      "name": "tooManyParticipants",
      "msg": "Too many participants. Maximum is 10."
    },
    {
      "code": 6005,
      "name": "unauthorized",
      "msg": "Only the owner can add expenses."
    }
  ],
  "types": [
    {
      "name": "balance",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "participant",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "expense",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "participants",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "split",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "balances",
            "type": {
              "vec": {
                "defined": {
                  "name": "balance"
                }
              }
            }
          },
          {
            "name": "expenses",
            "type": {
              "vec": {
                "defined": {
                  "name": "expense"
                }
              }
            }
          }
        ]
      }
    }
  ]
};
