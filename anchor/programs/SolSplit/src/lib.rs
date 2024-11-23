use anchor_lang::prelude::*;

declare_id!("AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ");

#[program]
pub mod solsplit {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, name: String) -> Result<()> {
        require!(name.len() <= 32, ErrorCode::NameTooLong);

        let split = &mut ctx.accounts.split;
        split.name = name;
        split.owner = *ctx.accounts.owner.key;
        split.balances = Vec::new();
        split.expenses = Vec::new();
        Ok(())
    }

    pub fn add_expense(
        ctx: Context<AddExpense>,
        description: String,
        amount: u64,
        participants: Vec<Pubkey>,
    ) -> Result<()> {
        require!(description.len() <= 32, ErrorCode::DescriptionTooLong);
        require!(!participants.is_empty(), ErrorCode::NoParticipants);
        require!(participants.len() <= 10, ErrorCode::TooManyParticipants);

        let split = &mut ctx.accounts.split;
        require!(
            ctx.accounts.owner.key() == split.owner,
            ErrorCode::Unauthorized
        );

        // Calculate share per participant
        let share = amount / (participants.len() as u64);

        // Update balances for each participant
        for participant in &participants {
            if *participant == split.owner {
                continue; // Skip owner as they are adding the expense
            }

            // Find existing balance or create new one
            let mut found = false;
            for balance in &mut split.balances {
                if balance.participant == *participant {
                    balance.amount += share;
                    found = true;
                    break;
                }
            }

            if !found {
                split.balances.push(Balance {
                    participant: *participant,
                    amount: share,
                });
            }
        }

        // Add to expense log
        split.expenses.push(Expense {
            description,
            amount,
            participants,
        });

        Ok(())
    }

    pub fn settle(ctx: Context<Settle>, participant: Pubkey) -> Result<()> {
        let split = &mut ctx.accounts.split;

        // Find and remove the balance
        let position = split
            .balances
            .iter()
            .position(|b| b.participant == participant)
            .ok_or(ErrorCode::NoOutstandingBalance)?;
        split.balances.remove(position);

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = owner,
        space = 8  // discriminator
            + 32   // name string (max 32 chars)
            + 32   // owner pubkey
            + 4 + (32 + 8) * 10  // balances vec (max 10 participants)
            + 4 + (32 + 8 + 4 + 32 * 10) * 20  // expenses vec (max 20 expenses)
    )]
    pub split: Account<'info, Split>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddExpense<'info> {
    #[account(mut)]
    pub split: Account<'info, Split>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct Settle<'info> {
    #[account(mut)]
    pub split: Account<'info, Split>,
}

#[account]
pub struct Split {
    pub name: String,
    pub owner: Pubkey,
    pub balances: Vec<Balance>,
    pub expenses: Vec<Expense>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Balance {
    pub participant: Pubkey,
    pub amount: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Expense {
    pub description: String,
    pub amount: u64,
    pub participants: Vec<Pubkey>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("No outstanding balance with the specified participant.")]
    NoOutstandingBalance,
    #[msg("Name must be 32 characters or less.")]
    NameTooLong,
    #[msg("Description must be 32 characters or less.")]
    DescriptionTooLong,
    #[msg("No participants provided.")]
    NoParticipants,
    #[msg("Too many participants. Maximum is 10.")]
    TooManyParticipants,
    #[msg("Only the owner can add expenses.")]
    Unauthorized,
}
