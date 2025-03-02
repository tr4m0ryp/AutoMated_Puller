const bs58 = require('bs58'); // Installeer eerst bs58 via npm: `npm install bs58`
const web3 = require('@solana/web3.js'); // Installeer eerst @solana/web3.js via npm: `npm install @solana/web3.js`

// Jouw private key als Uint8Array
const privateKeyArray = Uint8Array.from([
    174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56,
    222, 53, 138, 189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246,
    15, 185, 186, 82, 177, 240, 148, 69, 241, 227, 167, 80, 141, 89, 240, 121,
    121, 35, 172, 247, 68, 251, 226, 218, 48, 63, 176, 109, 168, 89, 238, 135,
]);

// Converteer de Uint8Array naar een base58-string
const privateKeyString = bs58.encode(privateKeyArray);
console.log('Private Key (base58):', privateKeyString);

// Maak een Keypair van de private key
const keypair = web3.Keypair.fromSecretKey(privateKeyArray);

// Haal de public key op
const publicKey = keypair.publicKey;
console.log('Public Key:', publicKey.toBase58());