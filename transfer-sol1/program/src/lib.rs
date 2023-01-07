// doing the transfer

use {
    std::convert::TryInto,
    solana_program::{
        account_info::{
            next_account_info, AccountInfo
        },
        entrypoint,
        entrypoint::ProgramResult,
        msg,
        program::invoke,
        program_error::ProgramError,
        pubkey::Pubkey,
        system_instruction,
    },
};

// entrypoint
entrypoint!(process_instruction);

// boilterplate solana
pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    input: &[u8],
) -> ProgramResult {
    // get account infromation
    let accounts_iter = &mut accounts.iter(); 
    let payer = next_account_info(accounts_iter)?; // sender
    let payee = next_account_info(accounts_iter)?; // receiver
    // initialize payer and payee involved in transaction

    // deserialize..get amount converting serialized byte array into an integer
    let amount = input
        .get(..8) // 8, bc 8 bytes
        .and_then(|slice| slice.try_into().ok()) // turning slice into int
        .map(u64::from_le_bytes) // mapping into u64
        .ok_or(ProgramError::InvalidInstructionData)?; // .ok_or function to return error if it doesn't work, for error handling

    // let amount = i32::try_from_slice(input);

    msg!("received request to transfer {:?} lamports from {:?} to {:?}.", 
        amount, payer.key, payee.key);
    msg!("  processing transfer...");

    // performing the transfer from payer to payee a specific amount
    invoke( // invoke comes from solana program
        &system_instruction::transfer(payer.key, payee.key, amount),
        &[payer.clone(), payee.clone()], 
    )?;
    
    msg!("transfer completed successfully!!");
    Ok(())
}

