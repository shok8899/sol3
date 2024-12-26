class ProfitTracker {
  constructor() {
    this.positions = new Map();
    this.trades = [];
  }

  updatePosition(tokenAddress, type, amount, price) {
    let position = this.positions.get(tokenAddress) || {
      amount: 0,
      averagePrice: 0,
      totalCost: 0
    };

    if (type === 'buy') {
      position.totalCost += amount * price;
      position.amount += amount;
      position.averagePrice = position.totalCost / position.amount;
    } else {
      const pnl = (price - position.averagePrice) * amount;
      this.recordTrade(tokenAddress, type, amount, price, pnl);
      
      position.amount -= amount;
      if (position.amount <= 0) {
        this.positions.delete(tokenAddress);
      } else {
        this.positions.set(tokenAddress, position);
      }
    }
  }

  recordTrade(tokenAddress, type, amount, price, pnl) {
    this.trades.push({
      timestamp: new Date(),
      tokenAddress,
      type,
      amount,
      price,
      pnl
    });
  }

  getPosition(tokenAddress) {
    return this.positions.get(tokenAddress);
  }

  getTotalPnL() {
    return this.trades.reduce((total, trade) => total + trade.pnl, 0);
  }

  getTradeHistory() {
    return this.trades;
  }
}

module.exports = { ProfitTracker };