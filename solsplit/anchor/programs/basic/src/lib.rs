use anchor_lang::prelude::*;
use std::collections::HashMap;

declare_id!("DYthvUhCSKtH3YVKFv4m9Yb9MNQqH2U5CFtwHxV6Mc1f");

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
    
        // Calculate split amount
        let split_amount = amount / group.members.len() as u64;
    
        // Use a temporary clone of members to avoid borrow conflicts
        let members = group.members.clone();
    
        // Update balances
        for member in members.iter() {
            if *member != payer {
                let payee_map = group.balances.entry(payer).or_insert_with(HashMap::new);
                *payee_map.entry(*member).or_insert(0) += split_amount;
            }
        }
    
        Ok(())
    }
    
    
    pub fn settle_balance(ctx: Context<SettleBalance>, payer: Pubkey, payee: Pubkey) -> Result<()> {
        let group = &mut ctx.accounts.group;
    
        // Access the balances for the specified payer
        if let Some(payee_map) = group.balances.get_mut(&payer) {
            // Remove the balance for the specified payee
            payee_map.remove(&payee);
    
            // If the payer's map is now empty, remove the payer entry entirely
            if payee_map.is_empty() {
                group.balances.remove(&payer);
            }
        }
    
        Ok(())
    }
    
    

    pub fn edit_expense(
        ctx: Context<EditExpense>,
        old_payer: Pubkey,
        new_payer: Pubkey,
        old_amount: u64,
        new_amount: u64,
    ) -> Result<()> {
        let group = &mut ctx.accounts.group;
    
        // Remove old balances related to the old expense
        if let Some(payee_map) = group.balances.get_mut(&old_payer) {
            payee_map.retain(|_, &mut amount| amount != old_amount);
    
            // Clean up empty maps
            if payee_map.is_empty() {
                group.balances.remove(&old_payer);
            }
        }
    
        // Add new balances for the new expense
        let split_amount = new_amount / group.members.len() as u64;
    
        // Use a temporary clone of members to avoid borrow conflicts
        let members = group.members.clone();
    
        for member in members.iter() {
            if *member != new_payer {
                let payee_map = group.balances.entry(new_payer).or_insert_with(HashMap::new);
                *payee_map.entry(*member).or_insert(0) += split_amount;
            }
        }
    
        Ok(())
    }
    
    

    pub fn delete_expense(ctx: Context<DeleteExpense>, payer: Pubkey, amount: u64) -> Result<()> {
        let group = &mut ctx.accounts.group;
    
        // Access the balances for the specified payer
        if let Some(payee_map) = group.balances.get_mut(&payer) {
            payee_map.retain(|_, &mut payee_amount| payee_amount != amount);
    
            // Clean up empty maps
            if payee_map.is_empty() {
                group.balances.remove(&payer);
            }
        }
    
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

#[derive(Accounts)]
pub struct SettleBalance<'info> {
    #[account(mut)]
    pub group: Account<'info, Group>,
    pub payer: Signer<'info>,
}

#[derive(Accounts)]
pub struct EditExpense<'info> {
    #[account(mut)]
    pub group: Account<'info, Group>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeleteExpense<'info> {
    #[account(mut)]
    pub group: Account<'info, Group>,
    pub owner: Signer<'info>,
}



#[account]
pub struct Group {
    pub name: String,
    pub owner: Pubkey,
    pub members: Vec<Pubkey>,
    pub balances: HashMap<Pubkey, HashMap<Pubkey, u64>>, // Nested map for payer->payee balances
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Balance {
    pub payer: Pubkey,
    pub payee: Pubkey,
    pub amount: u64,
}
