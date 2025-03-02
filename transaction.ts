const main = require('./walletbalance.ts');
const wallet_amounts = require("./amount_of_wallets.ts");

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

amount_to_be_sent();