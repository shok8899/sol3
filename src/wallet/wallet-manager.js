const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58');

class WalletManager {
  constructor(privateKeyString) {
    this.wallet = this.initializeWallet(privateKeyString);
  }

  initializeWallet(privateKeyString) {
    try {
      // Handle different private key formats
      let privateKey;
      
      if (privateKeyString.startsWith('[')) {
        // Array format
        privateKey = Uint8Array.from(JSON.parse(privateKeyString));
      } else if (privateKeyString.match(/^[0-9a-fA-F]+$/)) {
        // Hex format
        privateKey = Uint8Array.from(Buffer.from(privateKeyString, 'hex'));
      } else {
        // Base58 format
        privateKey = bs58.decode(privateKeyString);
      }

      return Keypair.fromSecretKey(privateKey);
    } catch (error) {
      throw new Error(`Failed to initialize wallet: ${error.message}`);
    }
  }

  getPublicKey() {
    return this.wallet.publicKey;
  }

  getKeypair() {
    return this.wallet;
  }
}

module.exports = { WalletManager };