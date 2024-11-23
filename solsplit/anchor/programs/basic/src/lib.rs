use anchor_lang::prelude::*;

declare_id!("ATXoGc1EmZjV7pgwzuHDwy98yHiMeu4SWEMBWyEKc7xi");

// main program

#[program]
pub mod solsplit {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, group_name: String) -> Result<()> {
        let group = &mut ctx.accounts.group;
        group.name = group_name;
        group.owner = *ctx.accounts.owner.key;
        group.members = vec![];
        Ok(())
    }

    pub fn add_member(ctx: Context<AddMember>, member: Pubkey) -> Result<()> {
        let group = &mut ctx.accounts.group;
        if !group.members.contains(&member) {
            group.members.push(member);
        }
        Ok(())
    }

    pub fn add_expense(ctx: Context<AddExpense>, amount: u64, payer: Pubkey) -> Result<()> {
        let group = &mut ctx.accounts.group;

        // Calculate the split amount
        let split_amount = amount / group.members.len() as u64;

        // Create a vector to store new balances
        let mut new_balances = vec![];

        // Iterate over group members and prepare balances
        for member in group.members.iter() {
            if *member != payer {
                new_balances.push(Balance {
                    payer,
                    payee: *member,
                    amount: split_amount,
                });
            }
        }

        // Update the group's balances after the iteration
        group.balances.extend(new_balances);

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = owner, space = 8 + 64 + 32 + 32 * 100)]
    pub group: Account<'info, Group>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddMember<'info> {
    #[account(mut)]
    pub group: Account<'info, Group>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct AddExpense<'info> {
    #[account(mut)]
    pub group: Account<'info, Group>,
    pub owner: Signer<'info>,
}

#[account]
pub struct Group {
    pub name: String,
    pub owner: Pubkey,
    pub members: Vec<Pubkey>,
    pub balances: Vec<Balance>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Balance {
    pub payer: Pubkey,
    pub payee: Pubkey,
    pub amount: u64,
}
