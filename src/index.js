const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const { Market } = require('@project-serum/serum');
const winston = require('winston');
const config = require('config');
const bs58 = require('bs58');
const { setupLogger } = require('./utils/logger');
const { WalletManager } = require('./wallet/wallet-manager');
const { TransactionMonitor } = require('./monitor/transaction-monitor');
const { TradeExecutor } = require('./trading/trade-executor');
const { ProfitTracker } = require('./trading/profit-tracker');

// Setup logger
const logger = setupLogger();

async function main() {
  try {
    logger.info('Starting Solana Trading Bot...');

    // Initialize connection
    const connection = new Connection(
      process.env.RPC_ENDPOINT || config.get('rpc.endpoint'),
      'confirmed'
    );

    // Initialize wallet
    const walletManager = new WalletManager(process.env.WALLET_PRIVATE_KEY);
    
    // Initialize profit tracker
    const profitTracker = new ProfitTracker();

    // Initialize trade executor
    const tradeExecutor = new TradeExecutor(
      connection,
      walletManager,
      config.get('trading'),
      profitTracker
    );

    // Initialize and start transaction monitor
    const monitor = new TransactionMonitor(
      connection,
      config.get('wallets.follow_addresses'),
      tradeExecutor
    );

    await monitor.start();

    logger.info('Bot successfully started and monitoring transactions');

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Shutting down bot...');
      await monitor.stop();
      process.exit(0);
    });

  } catch (error) {
    logger.error('Fatal error:', error);
    process.exit(1);
  }
}

main();