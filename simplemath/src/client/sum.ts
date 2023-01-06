import * as borsh from 'borsh';
import * as math from'./math'


class SimpleMathSum { // struct this time its a class
    sum = 0;
    constructor(fields: {sum: number} | undefined = undefined) {
        if (fields) {
            this.sum = fields.sum;
        }
    }
}

const SimpleMathSumSchema = new Map([ // map to turn it into a struct, this way it matches
    [SimpleMathSum, {kind: 'struct', fields: [['sum', 'u32']]}] 
]); // this creates the byte representation

const SIMPLEMATH_SIZE = borsh.serialize( // serialization
    SimpleMathSumSchema,
    new SimpleMathSum(),
).length; // get the length


async function main() {
    await math.example(`sum`, SIMPLEMATH_SIZE);
}

main().then(
    () => process.exit(),
    err => {
        console.error(err);
        process.exit(-1);
    },
);

