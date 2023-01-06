use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult, 
    msg,
    pubkey::Pubkey,
};

entrypoint!(process_instruction); // establish entrypoint using macro

fn process_instruction( // solana enter program on process_instruction
    // necessary parameters for entrypoint
    _program_id: &Pubkey,
    _accounts: &[AccountInfo],  // accounts doing business 
    _instruction_data: &[u8],    // instruction data, a byte array 
) -> ProgramResult {

    msg!("simple smart contract");
    Ok(())
}
