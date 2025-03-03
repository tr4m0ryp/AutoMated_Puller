const { Connection, Keypair, clusterApiUrl, PublicKey } = require("@solana/web3.js");
const bs58 = require("bs58");
const fs = require("fs");
const path = require("path");
const { createUmi } = require("@metaplex-foundation/umi-bundle-defaults");
const { 
  mplTokenMetadata, 
  TokenStandard,
  createV1,
  findMetadataPda
} = require("@metaplex-foundation/mpl-token-metadata");
const { 
  createSignerFromKeypair, 
  publicKey, 
  signerIdentity, 
  none,
  keypairIdentity,
  percentAmount,
} = require("@metaplex-foundation/umi");

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
const jsonFilePath = path.join(__dirname, "test.json");
const rawMetadata = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

async function uploadMetadata() {
  try {
    console.log("Uploading metadata to storage...");
    
    // In een productieomgeving zou je hier de metadata uploaden naar Arweave of IPFS
    // Voor het doel van deze demo, simuleren we een upload en retourneren een fictieve URL
    // In werkelijkheid zou je een service zoals NFT.Storage, Pinata, of Arweave gebruiken
    
    // Als voorbeeld, hier is hoe je het zou doen met een simpele service (pseudo-code):
    // const uploaded = await uploadToStorage(JSON.stringify(rawMetadata));
    // return uploaded.url;
    
    // Voor deze demo, retourneren we een bestaande URL
    // Je zou deze URL moeten vervangen door de echte URL na upload
    console.log("Metadata content:", rawMetadata);
    return "https://arweave.net/KZcaKyYC6JCvF4dQbuXB9aVbfdnS0FhaMfkvKJXt-Hc";
  } catch (error) {
    console.error("Error uploading metadata:", error);
    throw error;
  }
}


async function createTokenWithMetadata() {
  try {
    const metadataUri = await uploadMetadata();
    console.log("✅ Metadata uploaded to:", metadataUri);
    
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
      name: rawMetadata.name,
      symbol: rawMetadata.symbol,
      uri: metadataUri,
      sellerFeeBasisPoints: percentAmount(0),
      decimals: rawMetadata.decimals || 9,
      tokenStandard: TokenStandard.Fungible,
    }).sendAndConfirm(umi);
    
    const signatureBase58 = bs58.encode(transactionResult.signature);
    
    console.log("📄 Metadata TX:", `https://explorer.solana.com/tx/${signatureBase58}?cluster=devnet`);
    console.log("🎉 Token with metadata created successfully!");
    const metadataPda = findMetadataPda(umi, { mint: umiMintPublicKey });
    console.log("📋 Metadata Account:", metadataPda);
    console.log("🔍 Check your token at:", `https://solscan.io/token/${tokenMint.toBase58()}?cluster=devnet`);
    
  } catch (error) {
    console.error("❌ Error:", error);
    if (error.logs) {
      console.error("Program Logs:", error.logs);
    }
  }
}

createTokenWithMetadata();

async function verifyTokenMetadata(mintAddress) {
  try {
    console.log(`Verifying metadata for token: ${mintAddress}`);
    const mint = new PublicKey(mintAddress);
    const umiMintPublicKey = publicKey(mint.toBuffer());
    const metadataPda = findMetadataPda(umi, { mint: umiMintPublicKey });
    const metadata = await umi.programs.getMetadata().accounts.getMetadata({
      metadata: metadataPda,
    }).catch(err => {
      console.error("Error fetching metadata:", err);
      return null;
    });
    
    if (!metadata) {
      console.log("❌ No metadata found for this token");
      return;
    }
    
    console.log("✅ On-chain Metadata:");
    console.log("  Name:", metadata.name);
    console.log("  Symbol:", metadata.symbol);
    console.log("  URI:", metadata.uri);
    
    try {
      const response = await fetch(metadata.uri);
      const json = await response.json();
      console.log("✅ Off-chain Metadata:");
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log("❌ Could not fetch off-chain metadata:", e.message);
    }
  } catch (error) {
    console.error("Error verifying metadata:", error);
  }
}