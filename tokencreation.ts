const { Connection, Keypair, clusterApiUrl, PublicKey, Transaction } = require("@solana/web3.js");
const { createMint, getOrCreateAssociatedTokenAccount, mintTo } = require("@solana/spl-token");
const { createCreateMetadataAccountV3Instruction } = require("@metaplex-foundation/mpl-token-metadata");
const bs58 = require("bs58");

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

const base58PrivateKey = "2XmLCM8psDdFbtVCF1kfnsW4Cs3y6LXKiv6ct64gvZrBkeV3P5tgWp7ZF72SYnbfzBz2Ztd21VcakfMfruRZmFxZ";
const keypair = Keypair.fromSecretKey(bs58.decode(base58PrivateKey));
const fromWallet = keypair;

const METADATA_URI = "./test.json";

async function createTokenWithMetadata() {
  try {

    const tokenMint = await createMint(
      connection,
      fromWallet,
      fromWallet.publicKey,
      fromWallet.publicKey,
      9
    );
    console.log("✅ Token Mint:", tokenMint.toBase58());

    const metadata = {              
      uri: METADATA_URI,             
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null
    };

    const metadataProgramId = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
    const [metadataPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("metadata"), metadataProgramId.toBuffer(), tokenMint.toBuffer()],
      metadataProgramId
    );

    const tx = new Transaction().add(
      createCreateMetadataAccountV3Instruction(
        {
          metadata: metadataPDA,
          mint: tokenMint,
          mintAuthority: fromWallet.publicKey,
          payer: fromWallet.publicKey,
          updateAuthority: fromWallet.publicKey
        },
        {
          createMetadataAccountArgsV3: {
            data: metadata,
            isMutable: true,
            collectionDetails: null
          }
        }
      )
    );

    const txSignature = await connection.sendTransaction(tx, [fromWallet]);
    console.log("📄 Metadata TX:", `https://explorer.solana.com/tx/${txSignature}?cluster=devnet`);

    const associatedAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      fromWallet,
      tokenMint,
      fromWallet.publicKey
    );

    const mintTx = await mintTo(
      connection,
      fromWallet,
      tokenMint,
      associatedAccount.address,
      fromWallet,
      1000000000 
    );
    console.log("🪙 Mint TX:", `https://explorer.solana.com/tx/${mintTx}?cluster=devnet`);

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

createTokenWithMetadata();