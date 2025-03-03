//imports
const { Connection, Keypair, clusterApiUrl, PublicKey } = require("@solana/web3.js");
const bs58 = require("bs58");
const fs = require("fs");
const path = require("path");
const { createUmi } = require("@metaplex-foundation/umi-bundle-defaults");
const { mplTokenMetadata, TokenStandard, createV1, findMetadataPda} = require("@metaplex-foundation/mpl-token-metadata");
const { createSignerFromKeypair, publicKey, signerIdentity, none, keypairIdentity, percentAmount} = require("@metaplex-foundation/umi");
const { createMint } = require("@solana/spl-token");
const { NFTStorage, File } = require('nft.storage');

//constante die veranderd moeten/kunnen worden
const NFT_STORAGE_API_KEY = 'YOUR_API_KEY_HERE';
const base58PrivateKey = "2XmLCM8psDdFbtVCF1kfnsW4Cs3y6LXKiv6ct64gvZrBkeV3P5tgWp7ZF72SYnbfzBz2Ztd21VcakfMfruRZmFxZ";
const rpcUrl = clusterApiUrl("devnet");
const jsonFilePath = path.join(__dirname, "test.json");


//omzetting variabele in juiste vorm
const fromWalletKeypair = Keypair.fromSecretKey(bs58.decode(base58PrivateKey));
const umi = createUmi(rpcUrl).use(mplTokenMetadata());
const keypair = { publicKey: publicKey(fromWalletKeypair.publicKey.toBuffer()), secretKey: fromWalletKeypair.secretKey,};
umi.use(keypairIdentity(keypair));
const connection = new Connection(rpcUrl, "confirmed");
const rawMetadata = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

//decoingegevens uploaden online
async function uploadMetadata() {
    try {
        console.log("Uploading metadata to storage...");
        const imageData = fs.readFileSync(path.resolve(imagePath));
        const imageFile = new File([imageData], path.basename(imagePath), { type: 'image/png' });
        metadata.image = imageFile.name;

        const client = new NFTStorage({ token: NFT_STORAGE_API_KEY });
        const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
        const metadataFile = new File([metadataBlob], 'metadata.json');
        const cid = await client.storeDirectory([imageFile, metadataFile]);
        const url = `https://nftstorage.link/ipfs/${cid}/metadata.json`;
        return url;
    } catch (error) {
        console.error("Error uploading metadata:", error);
        throw error;
    }
    }

//coin aanmaak + toevoegen metadata
async function createTokenWithMetadata() {
    try {
        const metadataUri = await uploadMetadata();
        console.log("✅ Metadata uploaded to:", metadataUri);
        
        console.log("Creating token mint...");
        
        const mintKeypair = Keypair.generate();
        const tokenMint = await createMint(connection,fromWalletKeypair, fromWalletKeypair.publicKey, fromWalletKeypair.publicKey,9, mintKeypair);
        console.log("✅ Token Mint:", tokenMint.toBase58());

        const umiMintPublicKey = publicKey(tokenMint.toBuffer());
        const mintSigner = createSignerFromKeypair(umi, {publicKey: publicKey(mintKeypair.publicKey.toBuffer()), secretKey: mintKeypair.secretKey});
        
        console.log("Creating metadata for token...");
        const transactionResult = await createV1(umi, {
            mint: mintSigner,
            authority: umi.identity,
            name: rawMetadata.name,
            symbol: rawMetadata.symbol,
            uri: metadataUri,
            sellerFeeBasisPoints: percentAmount(0),
            decimals: rawMetadata.decimals || 9,
            tokenStandard: TokenStandard.Fungible
        }).sendAndConfirm(umi);
        
        const signatureBase58 = bs58.encode(transactionResult.signature);
        
        console.log("📄 Metadata TX:", `https://explorer.solana.com/tx/${signatureBase58}?cluster=devnet`);
        console.log("🎉 Token with metadata created successfully!");
        const metadataPda = findMetadataPda(umi, { mint: umiMintPublicKey });
        console.log("📋 Metadata Account:", metadataPda);
        console.log("🔍 Check your token at:", `https://solscan.io/token/${tokenMint.toBase58()}?cluster=devnet`);
        
    } catch (error) {
        console.error("Error:", error);
        
    }
    }

    createTokenWithMetadata();