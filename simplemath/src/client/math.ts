import {
    Keypair,
    Connection,
    PublicKey,
    LAMPORTS_PER_SOL,
    SystemProgram,
    TransactionInstruction,
    Transaction,
    sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
    createKeypairFromFile,
} from './util';
import fs from 'mz/fs';
import os from 'os';
import path from 'path';
import yaml from 'yaml';

// get keypair from local config
// path to Solana CLI config file
const CONFIG_FILE_PATH = path.resolve(
    os.homedir(),
    '.config',
    'solana',
    'cli',
    'config.yml',
);

let connection: Connection; // connection to Solana network
let localKeypair: Keypair;
let programKeypair: Keypair;
let programId: PublicKey;
let clientPubKey: PublicKey;

const PROGRAM_PATH = path.resolve(__dirname, '../../dist/program');

// connect to dev net
export async function connect(){
    connection = new Connection('https://api.devnet.solana.com','confirmed',);

    console.log('successfully connected to Solana devnet');
}

// get, use local keypair for client
// same keypair used to deploy program
export async function getLocalAccount(){
    const configYml = await fs.readFile(CONFIG_FILE_PATH, {encoding: 'utf8'});
    const keypairPath = await yaml.parse(configYml).keypair_path;
    localKeypair = await createKeypairFromFile(keypairPath);
    const airdropRequest = await connection.requestAirdrop(
        localKeypair.publicKey,
        LAMPORTS_PER_SOL * 2,
    );
    await connection.confirmTransaction(airdropRequest);

    console.log(`local account loaded successfully.`);
    console.log(`local account's address is:`);
    console.log(`   ${localKeypair.publicKey}`);
}

// get the targeted program
export async function getProgram(programName: string) {
    programKeypair = await createKeypairFromFile(
        path.join(PROGRAM_PATH, programName + '-keypair.json')
    );
    programId = programKeypair.publicKey;

    console.log(`We're going to ping the ${programName} program.`); // get program we intend to ping/transaction with
    console.log(`It's program ID is:`);
    console.log(`   ${programId.toBase58()}`)
}


// configure client model 
// client account is going to be the account that stores data**
// when we create account using test1 seed, this account will hit our program
// program will change the state of our account
export async function configureClientAccount(accountSpaceSize: number) {
    const SEED = 'test1'; 
    clientPubKey = await PublicKey.createWithSeed(  
    // use createWithSeed, allows us to create this key 'test1' with predictable seed value
    // makes programid the owner of this account we create
        localKeypair.publicKey,
        SEED,
        programId,
    );

    console.log(`for simplicity's sake, we've created an address using a seed`);
    console.log(`that seed is just the string "math"`);
    console.log(`the generated address is:`);
    console.log(`   ${clientPubKey.toBase58()}`);

    // make sure it doesn't exist already
    const clientAccount = await connection.getAccountInfo(clientPubKey);
    if(clientAccount === null){

        const transaction = new Transaction().add(
            SystemProgram.createAccountWithSeed({
                fromPubKey: localKeypair.publicKey,
                basePubKey: localKeypair.publicKey,
                seed: SEED, 
                newAccountPubkey: clientPubKey,
                lamports: LAMPORTS_PER_SOL,
                space: accountSpaceSize,
                programId,
            }),
        );
        await sendAndConfirmTransaction(connection, transaction, [localKeypair]);

        console.log(`client account created successfully`);
    }
    else {
        console.log(`looks like that account exists already. we can just use it`);
    }
}

// ping the program
export async function pingProgram(programName: string){
    console.log(`let's run it`);
    console.log(`pinging ${programName} program...`);

    const instruction = new TransactionInstruction({
        keys: [{pubkey: clientPubKey, isSinger: false, isWritable: true}],
        programId,
        data: Buffer.alloc(0), // empty instruction data
    });
    await sendAndConfirmTransaction(
        connection,
        new Transaction().add(instruction),
        [localKeypair],
    );

    console.log(`ping successful`);
}

// run example (main)
export async function example(programName: string, accountSpaceSize: number) {
    // account spacesize is size in bytes of what we need to store in this account
    await connect();
    await getLocalAccount();
    await getProgram(programName);
    await configureClientAccount(accountSpaceSize);
    await pingProgram(programName);
}

