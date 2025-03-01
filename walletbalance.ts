//wallet balance

const { Connection, PublicKey } = require('@solana/web3.js');

async function checkBalance(walletAddress) {
    const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
    const publicKey = new PublicKey(walletAddress);
    const balance = await connection.getBalance(publicKey);
    const solBalance = balance / 1000000000;
    return solBalance;
}

async function main(){
    const walletAddress = '47Mq7G9QZHU9S2uHJxcUgkG8KCw9jFcqcZ3QFYHVK45P';
    var balance = await checkBalance(walletAddress);
    return balance;
}

module.exports = main;



