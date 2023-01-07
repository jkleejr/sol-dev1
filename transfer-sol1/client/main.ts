import {
    Connection,
    Keypair,
    LAMPORTS_PER_SOL,
    PublicKey,
    sendAndConfirmTransaction,
    SystemProgram,
    Transaction,
    TransactionInstruction,
} from '@solana/web3.js';
import {readFileSync} from "fs";
import path from 'path';

const lo = require("buffer-layout");
// const BN = require("bn.js");


// variables
const SOLANA_NETWORK = "devnet";

let connection: Connection;
let programKeypair: Keypair;
let programId: PublicKey;

// keypairs from accounts folder
let firstKeypair: Keypair;
let secondKeypair: Keypair;
let thirdKeypair: Keypair;
let fourthKeypair: Keypair;


//helper functions
function createKeypairFromFile(path: string): Keypair {
    return Keypair.fromSecretKey(
        Buffer.from(JSON.parse(readFileSync(path, "utf-8")))
    )
}

// sending lamports using the right instructions for our Rust program
async function sendLamports(from: Keypair, to: PublicKey, amount: number) {
    
    let data = Buffer.alloc(8) // 8 bytes
    // lo.ns64("value").encode(new BN(amount), data);
    lo.ns64("value").encode(amount, data);

    let ins = new TransactionInstruction({
        keys: [
            // sender has to sign to permit the transaction
            {pubkey: from.publicKey, isSigner: true, isWritable: true}, // from publicKey, signer is first account
            {pubkey: to, isSigner: false, isWritable: true}, // second account is reciever, are writable to write new values to the account
            {pubkey: SystemProgram.programId, isSigner: false, isWritable: false}, // provide systemprogram.programId, the transfer of sol/lamports is a systemprogram
        ], // pass those in as the key^
        programId: programId, // our program Id
        data: data, // using serialized data
    }) 

    await sendAndConfirmTransaction( // send lamports/sol
        connection, 
        new Transaction().add(ins), 
        [from]
    );
}

// main 
async function main() {
    connection = new Connection(
        `https://api.${SOLANA_NETWORK}.solana.com`, 'confirmed'
    );

    programKeypair = createKeypairFromFile(
        path.join(
            path.resolve(__dirname, '../_dist/program'), 
            'program-keypair.json'
        )
    );
    programId = programKeypair.publicKey;

    // initialize 4 example keypairs first-fourth
    firstKeypair = createKeypairFromFile(__dirname + "/../accounts/ringo.json");
    secondKeypair = createKeypairFromFile(__dirname + "/../accounts/george.json");
    thirdKeypair = createKeypairFromFile(__dirname + "/../accounts/paul.json");
    fourthKeypair = createKeypairFromFile(__dirname + "/../accounts/john.json");
    
    // airdrop lamports to 3rd and 4th
    // await connection.confirmTransaction(
    //     await connection.requestAirdrop(
    //         thirdKeypair.publicKey,
    //         LAMPORTS_PER_SOL,
    //     )
    // );
    // await connection.confirmTransaction(
    //     await connection.requestAirdrop(
    //         fourthKeypair.publicKey,
    //         LAMPORTS_PER_SOL,
    //     )
    // );

    // fourth sends some solana to first
    console.log("4th sends some solana to 1st"); // printing just for reference
    console.log(`   fourth public key: ${fourthKeypair.publicKey}`);
    console.log(`   first public key: ${firstKeypair.publicKey}`);
    await sendLamports(fourthKeypair, firstKeypair.publicKey, 5000000); // amt is an amount of sol in lamports

main().then(
    () => process.exit(),
    err => {
        console.error(err);
        process.exit(-1);
    },
  );
}

