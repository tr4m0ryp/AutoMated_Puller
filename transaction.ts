//transaction maker
const main = require('./walletbalance.ts'); 
//const wallet_amouts = require('./amount_of_wallets.ts');


async function amount_to_be_sent(){
    try{
        const Wallet_Balance = await main();
        //const Wallet_Amounts = wallet_amouts();
        console.log(Wallet_Balance);
    }catch(error){
        console.log(`You are facing the error ${error}`);
    }
}