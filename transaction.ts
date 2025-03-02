const main = require('./walletbalance.ts');
const wallet_amounts = require("./amount_of_wallets.ts");
const web3 = require('@solana/web3.js');

async function amount_to_be_sent() {
    try {
        const Wallet_Balance = await main();
        const amount_of_wallets = await  wallet_amounts();


        console.log(`Wallet Balance: ${Wallet_Balance} SOL`);
        wallet_parts = Wallet_Balance - 0.5;
        amount_for_small_wallets = wallet_parts / amount_of_wallets;
        console.log(`Total amount to share on the wallets ${wallet_parts} and each wallet will receive ${amount_for_small_wallets} `);
    } catch (error) {
        console.error(`You are facing the error: ${error}`);
    }
}

async function transaction(){
    const connection = new web3.Connection(web3.clusterApiUrl('devnet'), 'confirmed');

    const from = web3.Keypair.fromSecretKey(
        Uint8Array.from([
            174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56,
            222, 53, 138, 189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246,
            15, 185, 186, 82, 177, 240, 148, 69, 241, 227, 167, 80, 141, 89, 240, 121,
            121, 35, 172, 247, 68, 251, 226, 218, 48, 63, 176, 109, 168, 89, 238, 135,
        ])
    );

    const fromPubKey = from.publicKey;
    const toPubkey = new web3.PublicKey("5FHwkrdxntdK24hgQU8qgBjn35Y1zwhz1GZwCkP2UJnM"); // Publieke sleutel van de ontvanger
    
    //transactie
    const transaction = new web3.Transaction().add (
        web3.SystemProgram.transfer({
            fromPubKey: fromPubKey,
            toPubkey: toPubkey,
            lamports: web3.LAMPORTS_PER_SOL /100,
        }),
    );

    //signature
    const signature = await web3.sendAndConfirmTransaction(
        connection,
        transaction,
        [from],
    );
    console.log('SIGNATURE', signature);
}

amount_to_be_sent();
transaction();