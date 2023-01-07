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
    getStringForInstruction,
    createCalculatorInstructions,
} from './util';
import fs from 'mz/fs';
import os from 'os';
import path from 'path';
import yaml from 'yaml';


// path to Solana CLI config file
const CONFIG_FILE_PATH = path.resolve(
    os.homedir(),
    '.config',
    'solana',
    'cli',
    'config.yml',
);


let connection: Connection;
let localKeypair: Keypair;
let programKeypair: Keypair;
let programId: PublicKey;
let clientPubKey: PublicKey;


const PROGRAM_PATH = path.resolve(__dirname, '../../dist/program');


// connect to dev net
export async function connect() {
    connection = new Connection('https://api.devnet.solana.com', 'confirmed');

    console.log(`successfully connected to Solana dev net!!`);
}


// use local keypair for client
export async function getLocalAccount() {
    const configYml = await fs.readFile(CONFIG_FILE_PATH, {encoding: 'utf8'});
    const keypairPath = await yaml.parse(configYml).keypair_path;
    localKeypair = await createKeypairFromFile(keypairPath);
    // const airdropRequest = await connection.requestAirdrop(
    //     localKeypair.publicKey,
    //     LAMPORTS_PER_SOL*1,
    // );
    // await connection.confirmTransaction(airdropRequest);

    console.log(`Local account loaded successfully.`);
    console.log(`Local account's address is:`);
    console.log(`   ${localKeypair.publicKey}`);
}


// get the targeted program
export async function getProgram(programName: string) {
    programKeypair = await createKeypairFromFile(
        path.join(PROGRAM_PATH, programName + '-keypair.json')
    );
    programId = programKeypair.publicKey;

    console.log(`We're going to ping the ${programName} program.`);
    console.log(`It's Program ID is:`);
    console.log(`   ${programId.toBase58()}`)
}


// configure client account
export async function configureClientAccount(accountSpaceSize: number) {
    const SEED = 'test1';
    clientPubKey = await PublicKey.createWithSeed(
        localKeypair.publicKey,
        SEED,
        programId,
    );

    console.log(`for simplicity's sake, we've created an address using a seed.`);
    console.log(`that seed is just the string "test(num)".`);
    console.log(`the generated address is:`);
    console.log(`   ${clientPubKey.toBase58()}`);

    // Make sure it doesn't exist already.
    const clientAccount = await connection.getAccountInfo(clientPubKey);
    if (clientAccount === null) {

        console.log(`looks like that account does not exist. let's create it.`);

        const transaction = new Transaction().add(
            SystemProgram.createAccountWithSeed({
                fromPubkey: localKeypair.publicKey,
                basePubkey: localKeypair.publicKey,
                seed: SEED,
                newAccountPubkey: clientPubKey,
                lamports: LAMPORTS_PER_SOL,
                space: accountSpaceSize,
                programId,
            }),
        );
        await sendAndConfirmTransaction(connection, transaction, [localKeypair]);

        console.log(`client account created successfully.`);
    } else {
        console.log(`looks like that account exists already. we can just use it.`);
    }
}


// ping the program
export async function pingProgram(
    operation: number, operatingValue: number) { 
    
    console.log(`let's run it.`);
    console.log(`pinging our calculator program...`);

    let calcInstructions = await createCalculatorInstructions(
        operation, operatingValue
    );

    console.log(`we're going to ${await getStringForInstruction(operation, operatingValue)}`)
    // string conversion, getStringForInstruciton method takes values and logs strings as output (in util.ts)

    const instruction = new TransactionInstruction({
        keys: [{pubkey: clientPubKey, isSigner: false, isWritable: true}],
        programId,
        data: calcInstructions, 
    });
    await sendAndConfirmTransaction(
        connection,
        new Transaction().add(instruction),
        [localKeypair],
    );

    console.log(`ping successful.`);
}


// run the example
export async function example(programName: string, accountSpaceSize: number) {
    await connect();
    await getLocalAccount();
    await getProgram(programName);
    await configureClientAccount(accountSpaceSize);
    await pingProgram(1, 4); // add 4
    await pingProgram(2, 1); // subtract 1
    await pingProgram(3, 2); // multiply by 2
}

