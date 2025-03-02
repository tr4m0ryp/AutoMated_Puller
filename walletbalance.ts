const { Connection, PublicKey } = require('@solana/web3.js');

async function checkBalance(walletAddress) {
    try {
        const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
        const publicKey = new PublicKey(walletAddress);
        const balance = await connection.getBalance(publicKey);
        const solBalance = balance / 1000000000; 
        return solBalance; //test
    } catch (error) {
        console.error(`Error checking balance: ${error}`);
        throw error; 
    }
}

async function main() {
    const walletAddress = '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1';
    try {
        const balance = await checkBalance(walletAddress);
        return balance;
    } catch (error) {
        console.error(`Error in main: ${error}`);
        throw error;
    }
}

module.exports = main;