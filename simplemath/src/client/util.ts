import {
    Keypair,
} 
from '@solana/web3.js';
import fs from 'mz/fs';

// take a file path to json keypair
// turn it into a keypair object from solana web3
export async function createKeypairFromFile(
    filePath: string,
): Promise<Keypair> {
    const secretKeyString = await fs.readFile(filePath, {encoding: 'utf8'});
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
    return Keypair.fromSecretKey(secretKey);
}
