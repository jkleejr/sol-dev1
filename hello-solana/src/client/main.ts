import {
    Keypair,
    Connection,
    PublicKey,
    LAMPORTS_PER_SOL,
    TransactionInstruction,
    Transaction,
    sendAndConfirmTransaction,
} 
from '@solana/web3.js'; // from web3.js dependency
import fs from 'mz/fs';
import path from 'path';

// establish a constant that represents our keypair we use to deploy the application
// keypair used to create on-chain Rust program
const PROGRAM_KEYPAIR_PATH = path.join(
    path.resolve(__dirname, '../../dist/program'),
    'hello_solana-keypair.json'
    );

    async function main() {
        console.log("Launching client...");

        // create new connection to solana devnet
        // using connection object, the first thing thats involved with solana web3 js dependency
        // set up w api
        let connection = new Connection('https://api.devnet.solana.com', 'confirmed');

        //get our program's public key
        const secretKeyString = await fs.readFile(PROGRAM_KEYPAIR_PATH, {encoding: 'utf8'})  
        // our secretkeystring, a read in of that file ^
        const secretKey = Uint8Array.from(JSON.parse(secretKeyString)); // parse secret key
        const programKeypair = Keypair.fromSecretKey(secretKey);      // generate keypair from secret key
        let programId: PublicKey = programKeypair.publicKey;    // get public key from keypair

        // now need to create account for transactions
        // generate keypair, request airdrop
        const triggerKeypair = Keypair.generate();
        const airdropRequest = await connection.requestAirdrop(  
            triggerKeypair.publicKey,
            LAMPORTS_PER_SOL,   // lamports_per_sol = 1 sol
        );
        await connection.confirmTransaction(airdropRequest);

        // conduct a transaction with the solana web3 js wrapper
        console.log('--Pinging Program ', programId.toBase58()); 
        //create new transactioninstruction by providing our keys, programID, data
        const instruction = new TransactionInstruction({   
            // ^^this is where solana sdk builds the encoded string as transaction instructions
            keys: [{pubkey: triggerKeypair.publicKey, isSigner: false, isWritable:true}], // keys
            programId,
            data: Buffer.alloc(0),
        });
        await sendAndConfirmTransaction(    // send transaction api call and confirm
            connection,
            new Transaction().add(instruction),
            [triggerKeypair],
        );
    }
    // npm run start, in package.json, "start": ts-node main.ts
    // tells it to run main.ts script
    main().then(  
        () => process.exit(),
        err => {
            console.error(err);
            process.exit(-1);
        },
    );
    // everytime typescript file is run, the program is pinged
    // can see solana program log every time

