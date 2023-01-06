
SOLANA_PROGRAMS=("sum" "square")

case $1 in
    "reset")
        #rm -rf ./node_modules # wipes all the node modules
        #done
        for program in "${SOLANA_PROGRAMS[@]}"; do
            cargo clean --manifest-path=./src/$program/Cargo.toml
        done
        #rm -rf dist/program
        ;;
    "clean")
        #rm -rf ./node_modules
        for program in "${SOLANA_PROGRAMS[@]}"; do
            cargo clean --manifest-path=./src/$program/Cargo.toml
        done;;
    "build")
        for program in "${SOLANA_PROGRAMS[@]}"; do
            cargo build-sbf --manifest-path=./src/$program/Cargo.toml --sbf-out-dir=./dist/program
        done;;
    "deploy")
        for program in "${SOLANA_PROGRAMS[@]}"; do
            cargo build-sbf --manifest-path=./src/$program/Cargo.toml --sbf-out-dir=./dist/program
            solana program deploy dist/program/$program.so
        done
        ;;
    "reset-and-build") 
        #rm -rf ./node_modules # wipe all the node modules
        #for x in $(solana program show --programs | awk 'RP==0 {print $1}'); do  # drop any programs running on Solana
        #    if [[ $x != "Program" ]]; 
        #    then 
        #        solana program close $x; 
        #    fi
        #done
        #rm -rf dist/program #remove any program .so files
        for program in "${SOLANA_PROGRAMS[@]}"; do #build each program and deploy them
            cargo clean --manifest-path=./src/$program/Cargo.toml
            cargo build-sbf --manifest-path=./src/$program/Cargo.toml --sbf-out-dir=./dist/program
            solana program deploy dist/program/$program.so
        done
        npm install #prepare our client 
        solana program show --programs
        ;;
esac