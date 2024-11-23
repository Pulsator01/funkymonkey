use anchor_lang::prelude::*;

declare_id!("6gUK82V42pHmTu7f3utXbZoiGzx3bZPpfx2HY65k78w7");

#[program]
pub mod solsplit {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, group_name: String) -> Result<()> {
        let group = &mut ctx.accounts.group;
        group.name = group_name;
        group.owner = *ctx.accounts.owner.key;
        group.members = vec![];
        group.expenses = vec![];
        group.balances = vec![];
        group.settlements = vec![];
        group.total_expenses = 0;
        group.created_at = Clock::get()?.unix_timestamp;
        Ok(())
    }

    pub fn add_member(ctx: Context<AddMember>, member: Pubkey, nickname: String) -> Result<()> {
        let group = &mut ctx.accounts.group;
        require!(
            !group.members.iter().any(|m| m.pubkey == member),
            CustomError::MemberAlreadyExists
        );

        group.members.push(GroupMember {
            pubkey: member,
            nickname,
            joined_at: Clock::get()?.unix_timestamp,
            total_paid: 0,
            total_owed: 0,
        });
        Ok(())
    }

    pub fn add_expense(
        ctx: Context<AddExpense>,
        amount: u64,
        description: String,
        payer: Pubkey,
        split_type: SplitType,
        custom_splits: Option<Vec<CustomSplit>>,
    ) -> Result<()> {
        let group = &mut ctx.accounts.group;
        let timestamp = Clock::get()?.unix_timestamp;

        require!(
            group.members.iter().any(|m| m.pubkey == payer),
            CustomError::PayerNotGroupMember
        );

        let splits = match split_type {
            SplitType::Equal => {
                let split_amount = amount / group.members.len() as u64;
                group
                    .members
                    .iter()
                    .filter(|m| m.pubkey != payer)
                    .map(|m| CustomSplit {
                        member: m.pubkey,
                        amount: split_amount,
                    })
                    .collect::<Vec<CustomSplit>>()
            }
            SplitType::Custom => {
                require!(custom_splits.is_some(), CustomError::CustomSplitsRequired);
                custom_splits.unwrap()
            }
            SplitType::Percentage => {
                require!(custom_splits.is_some(), CustomError::CustomSplitsRequired);
                let splits = custom_splits.unwrap();
                splits
                    .iter()
                    .map(|split| CustomSplit {
                        member: split.member,
                        amount: (amount as f64 * (split.amount as f64 / 100.0)) as u64,
                    })
                    .collect()
            }
        };

        let total_splits: u64 = splits.iter().map(|s| s.amount).sum();
        require!(total_splits == amount, CustomError::InvalidSplitAmount);

        let expense = Expense {
            id: group.expenses.len() as u32,
            description,
            amount,
            payer,
            splits: splits.clone(),
            timestamp,
            status: ExpenseStatus::Active,
        };

        for split in &splits {
            let mut balance_updated = false;

            for balance in group.balances.iter_mut() {
                if balance.payer == payer && balance.payee == split.member {
                    balance.amount = balance
                        .amount
                        .checked_add(split.amount)
                        .ok_or(CustomError::CalculationOverflow)?;
                    balance_updated = true;
                    break;
                }
            }

            if !balance_updated {
                group.balances.push(Balance {
                    payer,
                    payee: split.member,
                    amount: split.amount,
                });
            }
        }

        if let Some(payer_member) = group.members.iter_mut().find(|m| m.pubkey == payer) {
            payer_member.total_paid = payer_member
                .total_paid
                .checked_add(amount)
                .ok_or(CustomError::CalculationOverflow)?;
        }

        for split in &splits {
            if let Some(member) = group.members.iter_mut().find(|m| m.pubkey == split.member) {
                member.total_owed = member
                    .total_owed
                    .checked_add(split.amount)
                    .ok_or(CustomError::CalculationOverflow)?;
            }
        }

        group.expenses.push(expense);
        group.total_expenses = group
            .total_expenses
            .checked_add(amount)
            .ok_or(CustomError::CalculationOverflow)?;

        Ok(())
    }

    pub fn settle_debt(
        ctx: Context<SettleDebt>,
        amount: u64,
        payer: Pubkey,
        payee: Pubkey,
    ) -> Result<()> {
        let group = &mut ctx.accounts.group;

        let balance = group
            .balances
            .iter_mut()
            .find(|b| b.payer == payer && b.payee == payee)
            .ok_or(CustomError::BalanceNotFound)?;

        require!(balance.amount >= amount, CustomError::InsufficientBalance);

        balance.amount = balance
            .amount
            .checked_sub(amount)
            .ok_or(CustomError::CalculationOverflow)?;

        group.settlements.push(Settlement {
            payer,
            payee,
            amount,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    pub fn delete_expense(ctx: Context<DeleteExpense>, expense_id: u32) -> Result<()> {
        let group = &mut ctx.accounts.group;

        let expense_index = group
            .expenses
            .iter()
            .position(|e| e.id == expense_id)
            .ok_or(CustomError::ExpenseNotFound)?;

        let expense = group.expenses[expense_index].clone();
        require!(
            expense.status == ExpenseStatus::Active,
            CustomError::ExpenseAlreadyDeleted
        );

        for split in &expense.splits {
            for balance in group.balances.iter_mut() {
                if balance.payer == expense.payer && balance.payee == split.member {
                    balance.amount = balance
                        .amount
                        .checked_sub(split.amount)
                        .ok_or(CustomError::CalculationOverflow)?;
                }
            }
        }

        group.expenses[expense_index].status = ExpenseStatus::Deleted;
        group.total_expenses = group
            .total_expenses
            .checked_sub(expense.amount)
            .ok_or(CustomError::CalculationOverflow)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = owner, space = 8 + 1000)]
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
pub struct SettleDebt<'info> {
    #[account(mut)]
    pub group: Account<'info, Group>,
    pub signer: Signer<'info>,
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
    pub members: Vec<GroupMember>,
    pub expenses: Vec<Expense>,
    pub balances: Vec<Balance>,
    pub settlements: Vec<Settlement>,
    pub total_expenses: u64,
    pub created_at: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub struct GroupMember {
    pub pubkey: Pubkey,
    pub nickname: String,
    pub joined_at: i64,
    pub total_paid: u64,
    pub total_owed: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Expense {
    pub id: u32,
    pub description: String,
    pub amount: u64,
    pub payer: Pubkey,
    pub splits: Vec<CustomSplit>,
    pub timestamp: i64,
    pub status: ExpenseStatus,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum ExpenseStatus {
    Active,
    Deleted,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Balance {
    pub payer: Pubkey,
    pub payee: Pubkey,
    pub amount: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Settlement {
    pub payer: Pubkey,
    pub payee: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CustomSplit {
    pub member: Pubkey,
    pub amount: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum SplitType {
    Equal,
    Custom,
    Percentage,
}

#[error_code]
pub enum CustomError {
    #[msg("Member already exists in the group")]
    MemberAlreadyExists,
    #[msg("Payer is not a group member")]
    PayerNotGroupMember,
    #[msg("Custom splits are required for this split type")]
    CustomSplitsRequired,
    #[msg("Invalid split amount")]
    InvalidSplitAmount,
    #[msg("Calculation overflow")]
    CalculationOverflow,
    #[msg("Balance not found")]
    BalanceNotFound,
    #[msg("Expense not found")]
    ExpenseNotFound,
    #[msg("Expense has already been deleted")]
    ExpenseAlreadyDeleted,
    #[msg("Insufficient balance to settle debt")]
    InsufficientBalance,
}
