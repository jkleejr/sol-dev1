import { Keypair } from '@solana/web3.js';
import fs from 'mz/fs';
import * as BufferLayout from  '@solana/buffer-layout';
import { Buffer } from 'buffer';
  
  
export async function createKeypairFromFile(
    filePath: string,
): Promise<Keypair> {
    const secretKeyString = await fs.readFile(filePath, {encoding: 'utf8'});
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
    return Keypair.fromSecretKey(secretKey);
}


export async function getStringForInstruction(
    operation: number, operating_value: number) { // takes values (from math.ts) and returns strings as output

    if (operation == 0) {
        return "reset the example.";
    } else if (operation == 1) {
        return `add: ${operating_value}`;
    } else if (operation == 2) {
        return `subtract: ${operating_value}`;
    } else if (operation == 3) {
        return `multiply by: ${operating_value}`;
    }
}


export async function createCalculatorInstructions(
    operation: number, operating_value: number): Promise<Buffer> {  // pass in the 2 numbers

    const bufferLayout: BufferLayout.Structure<any> = BufferLayout.struct( // provided by solana buffer-layout package(readme)
    // bufferlayout takes object, 'maps' it into bytes
        [
            BufferLayout.u32('operation'), //use u32 function to create a byte representation of u32 field called 'operation'
            BufferLayout.u32('operating_value'), // byte representation 'operating_value'
            // creates schema
        ]
    );

    const buffer = Buffer.alloc(bufferLayout.span); // can allocate the size
    bufferLayout.encode({ //encode it
        operation: operation,
        operating_value: operating_value,
    }, buffer);
    // convert what you are expecting as instruction struct into bytes so network can understand 
    //goes in bpf?(sbf) format

    return buffer;
    // sets up program instructions
}

