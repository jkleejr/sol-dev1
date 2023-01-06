import * as borsh from 'borsh';
import * as math from'./math'


class SimpleMathSquare { // struct this time its a class
    sum = 0;
    constructor(fields: {sum: number} | undefined = undefined) {
        if (fields) {
            this.sum = fields.sum;
        }
    }
}

const SimpleMathSquareSchema = new Map([ // map to turn it into a struct, this way it matches
    [SimpleMathSquare, {kind: 'struct', fields: [['square', 'u32']]}] 
]); // this creates the byte representation

const SIMPLEMATH_SIZE = borsh.serialize( // serialization
    SimpleMathSquareSchema,
    new SimpleMathSquare(),
).length; // get the length


async function main() {
    await math.example(`square`, SIMPLEMATH_SIZE);
}

main().then(
    () => process.exit(),
    err => {
        console.error(err);
        process.exit(-1);
    },
);

