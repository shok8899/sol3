const { PublicKey } = require('@solana/web3.js');
const winston = require('winston');

class TransactionMonitor {
  constructor(connection, followAddresses, tradeExecutor) {
    this.connection = connection;
    this.followAddresses = followAddresses.map(addr => new PublicKey(addr));
    this.tradeExecutor = tradeExecutor;
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'monitor.log' })
      ]
    });
    this.subscription = null;
  }

  async start() {
    this.subscription = this.connection.onLogs(
      this.followAddresses,
      async (logs) => {
        try {
          await this.handleTransaction(logs);
        } catch (error) {
          this.logger.error('Error processing transaction:', error);
        }
      },
      'confirmed'
    );

    this.logger.info('Started monitoring transactions for addresses:', 
      this.followAddresses.map(addr => addr.toString()));
  }

  async handleTransaction(logs) {
    const signature = logs.signature;
    const tx = await this.connection.getTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0
    });

    if (!tx) return;

    // Analyze transaction and execute trades
    await this.tradeExecutor.analyzeTrade(tx);
  }

  async stop() {
    if (this.subscription) {
      await this.connection.removeOnLogsListener(this.subscription);
      this.logger.info('Stopped monitoring transactions');
    }
  }
}

module.exports = { TransactionMonitor };