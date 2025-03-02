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
    const walletAddress = '47Mq7G9QZHU9S2uHJxcUgkG8KCw9jFcqcZ3QFYHVK45P';
    try {
        const balance = await checkBalance(walletAddress);
        return balance;
    } catch (error) {
        console.error(`Error in main: ${error}`);
        throw error;
    }
}

module.exports = main;