use borsh::{BorshDeserialize, BorshSerialize}; // for borsh dependencies
use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult, 
    msg,
    program_error::programError,
    pubkey::Pubkey,
};

#[derive(BorshDeserialize, BorshDeserialize, Debug)]
pub struct MathStuffSum {
    pub sum: u32,
}

entrypoint!(process_instruction); // establish entrypoint using macro

fn process_instruction( // solana enter program on process_instruction
    // necessary parameters for entrypoint
    _program_id: &Pubkey,
    _accounts: &[AccountInfo],  // accounts doing business 
    _instruction_data: &[u8],    // instruction data, a byte array 
) -> ProgramResult {

    // iterating accounts is safer than indexing
    let accounts_iter = &mut accounts.iter();

    // get the account to say hello to
    let account = next_account_info(accounts_iter)?; 

    // the account must be owned by the program in order to modify its data
    // big solana rule
    if account.owner != program_id {
        msg!("Account does not have the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    }

    Ok(())
}

