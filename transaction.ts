const main = require('./walletbalance.js');

async function amount_to_be_sent() {
    try {
        const Wallet_Balance = await main();
        console.log(`Wallet Balance: ${Wallet_Balance} SOL`);
    } catch (error) {
        console.error(`You are facing the error: ${error}`);
    }
}

amount_to_be_sent();