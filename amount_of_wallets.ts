const main = require('./walletbalance.ts'); 
const wallet_liquid_amount = 0.02;
const solanaWeb3 = require("@solana/web3.js");
const bs58 = require('bs58');
const fs = require('fs');

async function wallet_amount_check() {
    try {
        const balance = await main();
        console.log(`Imported balance: ${balance} SOL`);
    } catch (error) {
        console.error('Error fetching balance:', error);
    }
}

async function wallet_amounts() {
    try {
        const balance = await main();
        const float_balance = parseFloat(balance);
        const wallet_amount = Math.floor(float_balance / wallet_liquid_amount);
        console.log(`Aantal wallets om te genereren: ${wallet_amount}`);
        return wallet_amount;
    } catch (error) {
        console.log(`You are facing the following error: ${error}`);
    }
}

async function wallet_generator() {
    try {
        const keyPair = solanaWeb3.Keypair.generate();
        const publicKey = keyPair.publicKey.toString();
        const secretKeyBase58 = bs58.encode(keyPair.secretKey);
        //console.log("Public Key:", publicKey);
        //console.log("Secret Key:", secretKeyBase58);
        return { publicKey, secretKeyBase58 };
    } catch (error) {
        console.log(error);
    }
}

async function main_0() {
    try {
        await wallet_amount_check();
        const gen_amount = await wallet_amounts();
        const keys = [];

        for (let i = 0; i < gen_amount; i++) {
            const keyPair = await wallet_generator();
            keys.push(keyPair); 
        }

        let content = '';
        keys.forEach((keyPair, index) => {
            content += `Public Key: ${keyPair.publicKey}\n`;
            content += `Secret Key: ${keyPair.secretKeyBase58}\n\n`;
        });

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `privatekeys.${timestamp}.txt`;
        fs.writeFileSync(fileName, content, 'utf8');
        console.log(`Keys opgeslagen in: ${fileName}`);
    } catch (error) {
        console.log(error);
    }
}

main_0();

module.exports = wallet_amounts;
