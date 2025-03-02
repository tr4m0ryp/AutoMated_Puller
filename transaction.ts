const main = require('./walletbalance.ts');
const web3 = require('@solana/web3.js');
const bs58 = require('bs58');
const fs = require('fs');
const { wallet_amounts, main_0 } = require('./amount_of_wallets.ts');

async function amount_to_be_sent(walletBalance, amount_of_wallets) {
    try {
        console.log(`Wallet Balance: ${walletBalance} SOL`);
        const wallet_parts = walletBalance - 0.5;
        const amount_for_small_wallets = wallet_parts / amount_of_wallets;
        console.log(`Total amount to share on the wallets ${wallet_parts} and each wallet will receive ${amount_for_small_wallets}`);

        return amount_for_small_wallets;
    } catch (error) {
        console.error(`You are facing the error: ${error}`);
    }
}

async function readPublicKeysFromFile(fileName) {
    try {
        const content = fs.readFileSync(fileName, 'utf8');
        const lines = content.split('\n');
        const publicKeys = [];

        for (let i = 0; i < lines.length; i += 3) {
            if (lines[i].startsWith('Public Key:')) {
                const publicKey = lines[i].split('Public Key: ')[1].trim();
                publicKeys.push(publicKey);
            }
        }

        return publicKeys;
    } catch (error) {
        console.error('Error reading public keys from file:', error);
        return [];
    }
}

async function transaction() {
    const connection = new web3.Connection(web3.clusterApiUrl('devnet'), 'confirmed'); //devnet moet later op mainnet gezet worden

    const privateKeyString = "2XmLCM8psDdFbtVCF1kfnsW4Cs3y6LXKiv6ct64gvZrBkeV3P5tgWp7ZF72SYnbfzBz2Ztd21VcakfMfruRZmFxZ"; //privatekey - moet straks veranderd worden
    const privateKeyArray = bs58.decode(privateKeyString);

    const from = web3.Keypair.fromSecretKey(privateKeyArray);
    const fromPubKey = from.publicKey;

    const balance = await connection.getBalance(fromPubKey);
    console.log(`Saldo van het verzendende account: ${balance / web3.LAMPORTS_PER_SOL} SOL`);

    if (balance === 0) {
        console.error('Het verzendende account heeft geen SOL. Voeg SOL toe om transacties uit te voeren.');
        return;
    }

    // Genereer wallets en krijg de bestandsnaam
    const fileName = await main_0(); // main_0 wordt hier slechts één keer aangeroepen

    // Lees de public keys uit het gegenereerde bestand
    const publicKeys = await readPublicKeysFromFile(fileName);

    if (publicKeys.length === 0) {
        console.error('Geen public keys gevonden in het bestand.');
        return;
    }

    // Bereken het bedrag per wallet
    const walletBalance = await main();
    const amount_of_wallets = publicKeys.length; // Gebruik het aantal gegenereerde wallets
    const amount_per_wallet = await amount_to_be_sent(walletBalance, amount_of_wallets);
    const transaction_amount = web3.LAMPORTS_PER_SOL / 100; // Converteer SOL naar lamports

    // Verstuur het bedrag naar elke public key
    for (const toPubkey of publicKeys) {
        try {
            const transaction = new web3.Transaction().add(
                web3.SystemProgram.transfer({
                    fromPubkey: fromPubKey,
                    toPubkey: new web3.PublicKey(toPubkey),
                    lamports: transaction_amount,
                }),
            );

            const signature = await web3.sendAndConfirmTransaction(
                connection,
                transaction,
                [from],
            );
            console.log(`Transactie succesvol naar ${toPubkey}! Handtekening:`, signature);
        } catch (error) {
            console.error(`Transactie mislukt naar ${toPubkey}:`, error);
        }
    }
}

// Voer de transactie uit
transaction();