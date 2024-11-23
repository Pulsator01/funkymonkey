#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ");

#[program]
pub mod SolSplit {
    use super::*;

  pub fn close(_ctx: Context<CloseSolSplit>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.SolSplit.count = ctx.accounts.SolSplit.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.SolSplit.count = ctx.accounts.SolSplit.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeSolSplit>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.SolSplit.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeSolSplit<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + SolSplit::INIT_SPACE,
  payer = payer
  )]
  pub SolSplit: Account<'info, SolSplit>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseSolSplit<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub SolSplit: Account<'info, SolSplit>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub SolSplit: Account<'info, SolSplit>,
}

#[account]
#[derive(InitSpace)]
pub struct SolSplit {
  count: u8,
}
