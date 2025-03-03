
const { Connection, Keypair, clusterApiUrl, PublicKey } = require("@solana/web3.js");
const bs58 = require("bs58");


const { createUmi } = require("@metaplex-foundation/umi-bundle-defaults");
const { mplTokenMetadata, TokenStandard,createV1} = require("@metaplex-foundation/mpl-token-metadata");
const { createSignerFromKeypair, publicKey, signerIdentity, none,keypairIdentity,percentAmount,base58PublicKey} = require("@metaplex-foundation/umi");

const { createMint } = require("@solana/spl-token");


const rpcUrl = clusterApiUrl("devnet");

const base58PrivateKey = "2XmLCM8psDdFbtVCF1kfnsW4Cs3y6LXKiv6ct64gvZrBkeV3P5tgWp7ZF72SYnbfzBz2Ztd21VcakfMfruRZmFxZ";
const fromWalletKeypair = Keypair.fromSecretKey(bs58.decode(base58PrivateKey));
const umi = createUmi(rpcUrl).use(mplTokenMetadata());
const keypair = {
  publicKey: publicKey(fromWalletKeypair.publicKey.toBuffer()),
  secretKey: fromWalletKeypair.secretKey,
};
umi.use(keypairIdentity(keypair));
const connection = new Connection(rpcUrl, "confirmed");

const METADATA_URI = "https://arweave.net/KZcaKyYC6JCvF4dQbuXB9aVbfdnS0FhaMfkvKJXt-Hc";

async function createTokenWithMetadata() {
  try {
    console.log("Creating token mint...");
    const mintKeypair = Keypair.generate();
    const tokenMint = await createMint(
      connection,
      fromWalletKeypair,          
      fromWalletKeypair.publicKey, 
      fromWalletKeypair.publicKey, 
      9,                          
      mintKeypair  
    );
    
    console.log("✅ Token Mint:", tokenMint.toBase58());
    const umiMintPublicKey = publicKey(tokenMint.toBuffer());
    const mintSigner = createSignerFromKeypair(umi, {
      publicKey: publicKey(mintKeypair.publicKey.toBuffer()),
      secretKey: mintKeypair.secretKey,
    });
    
    console.log("Creating metadata for token...");
    const transactionResult = await createV1(umi, {
      mint: mintSigner, 
      authority: umi.identity,
      uri: METADATA_URI,
      sellerFeeBasisPoints: percentAmount(0),
      decimals: 9,
      tokenStandard: TokenStandard.Fungible,
    }).sendAndConfirm(umi);
    
    const signatureBase58 = bs58.encode(transactionResult.signature);
    
    console.log("📄 Metadata TX:", `https://explorer.solana.com/tx/${signatureBase58}?cluster=devnet`);
    console.log("🎉 Token with metadata created successfully!");
    
  } catch (error) {
    console.error("❌ Error:", error);
    if (error.logs) {
      console.error("Program Logs:", error.logs);
    }
  }
}

createTokenWithMetadata();