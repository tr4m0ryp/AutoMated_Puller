const main = require('./walletbalance.ts');
const wallet_amounts = require("./amount_of_wallets.ts");
const web3 = require('@solana/web3.js');
const bs58 = require('bs58');

async function amount_to_be_sent() {
    try {
        const Wallet_Balance = await main();
        const amount_of_wallets = await wallet_amounts();

        console.log(`Wallet Balance: ${Wallet_Balance} SOL`);
        const wallet_parts = Wallet_Balance - 0.5;
        const amount_for_small_wallets = wallet_parts / amount_of_wallets;
        console.log(`Total amount to share on the wallets ${wallet_parts} and each wallet will receive ${amount_for_small_wallets}`);

        return amount_for_small_wallets;
    } catch (error) {
        console.error(`You are facing the error: ${error}`);
    }
}


async function transaction() {
    const connection = new web3.Connection(web3.clusterApiUrl('devnet'), 'confirmed');

    const privateKeyString = "2XmLCM8psDdFbtVCF1kfnsW4Cs3y6LXKiv6ct64gvZrBkeV3P5tgWp7ZF72SYnbfzBz2Ztd21VcakfMfruRZmFxZ";
    const privateKeyArray = bs58.decode(privateKeyString);
    const from = web3.Keypair.fromSecretKey(privateKeyArray);
    const fromPubKey = from.publicKey;
    const toPubkey = new web3.PublicKey("4QMozwtRUJC8ZjwzXGyEi7y83nfijs2SgDj2oe1VkM7B");

    const balance = await connection.getBalance(fromPubKey);
    console.log(`Saldo van het verzendende account: ${balance / web3.LAMPORTS_PER_SOL} SOL`);

    const transaction_amount = web3.LAMPORTS_PER_SOL/ 100;

    // Transactie
    const transaction = new web3.Transaction().add(
        web3.SystemProgram.transfer({
            fromPubkey: fromPubKey,
            toPubkey: toPubkey,
            lamports: transaction_amount,
        }),
    );

    try {
        const signature = await web3.sendAndConfirmTransaction(
            connection,
            transaction,
            [from],
        );
        console.log('Transactie succesvol! Handtekening:', signature);
    } catch (error) {
        console.error('Transactie mislukt:', error);
    }
}

// Voer de transactie uit
transaction();
//etes