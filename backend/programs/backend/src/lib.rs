use anchor_lang::prelude::*;

declare_id!("BRHKjMLrVzVaE1aCkS6heDtVzHesQXbEuBwMYZnhVVKB");

#[program]
pub mod solsplit {
    use super::*;

    // Create a new group for splitting expenses
    pub fn create_group(ctx: Context<CreateGroup>, name: String) -> Result<()> {
        let group = &mut ctx.accounts.group;
        group.name = name;
        group.owner = *ctx.accounts.user.key;
        group.total_expenses = 0;
        group.total_members = 0;

        Ok(())
    }

    // Add a member to an existing group
    pub fn add_member(ctx: Context<AddMember>, group_id: Pubkey) -> Result<()> {
        let group = &mut ctx.accounts.group;
        require!(
            group.owner == *ctx.accounts.user.key,
            CustomError::NotGroupOwner
        );
        group.total_members += 1;
        Ok(())
    }

    // Add an expense to the group
    pub fn add_expense(
        ctx: Context<AddExpense>,
        group_id: Pubkey,
        amount: u64,
        description: String,
    ) -> Result<()> {
        let group = &mut ctx.accounts.group;
        let expense = &mut ctx.accounts.expense;

        expense.group_id = group_id;
        expense.amount = amount;
        expense.description = description;
        expense.user = *ctx.accounts.user.key;

        group.total_expenses += amount;

        Ok(())
    }

    // Get the share for each member of the group
    pub fn get_share(ctx: Context<GetShare>, group_id: Pubkey) -> Result<u64> {
        let group = &ctx.accounts.group;
        require!(group.total_members > 0, CustomError::NoMembersInGroup);
        let share = group.total_expenses / group.total_members as u64;
        Ok(share)
    }
}

#[derive(Accounts)]
pub struct CreateGroup<'info> {
    #[account(init, payer = user, space = Group::LEN)]
    pub group: Account<'info, Group>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddMember<'info> {
    #[account(mut)]
    pub group: Account<'info, Group>,
    #[account(mut)]
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct AddExpense<'info> {
    #[account(mut)]
    pub group: Account<'info, Group>,
    #[account(init, payer = user, space = Expense::LEN)]
    pub expense: Account<'info, Expense>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GetShare<'info> {
    #[account(mut)]
    pub group: Account<'info, Group>,
}

#[account]
pub struct Group {
    pub name: String,
    pub owner: Pubkey,
    pub total_expenses: u64,
    pub total_members: u64,
}

impl Group {
    pub const LEN: usize = 8 + 32 + 4 + 4 + 32; // Discriminant + name + owner + expenses + members
}

#[account]
pub struct Expense {
    pub group_id: Pubkey,
    pub amount: u64,
    pub description: String,
    pub user: Pubkey,
}

impl Expense {
    pub const LEN: usize = 8 + 32 + 8 + 4 + 32; // Discriminant + group_id + amount + description + user
}

#[error_code]
pub enum CustomError {
    #[msg("Only the group owner can add members")]
    NotGroupOwner,

    #[msg("The group has no members to split the expense")]
    NoMembersInGroup,
}
