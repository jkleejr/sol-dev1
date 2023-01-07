# Transfer SOL

Simple example of transferring lamports (SOL).

### Creating the example keypairs:

```shell
solana-keygen new --no-bip39-passphrase -o transfer-sol/accounts/first.json
```

### Viewing their public keys:

```shell
solana-keygen pubkey transfer-sol/accounts/first.json
```

```shell
first:      2EQ94uuhLgB5J6wz8HBS3zjGdxQ5uGFQperUVmPJQiDf
second:     BvYH77gzXD2BDmHE34w6yixm4u2hqHia8YQZ31iZtjWh
third:       3dAzccfqzR44xhhagTKw1akvE3E16T8wVjuEgsyurjTn
fourth:       Bw7ac9cTxxv21eiNKTQgTjjcardH4n7xMRLtfzzAqi2p
```

### Airdropping:

```shell
solana airdrop --keypair transfer-sol/accounts/fourth.json 2
```

### Viewing their balances:

```shell
solana account <pubkey> 
```

## Run the example:

In one terminal:
```shell
npm run reset-and-build
npm run simulation
```

In another terminal:
```shell
solana logs | grep "<program id> invoke" -A 7
```

