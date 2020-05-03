import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const balance: Balance = {
      income: 0,
      outcome: 0,
      total: 0,
    };

    const transactions = await this.find();

    transactions.map(transaction => {
      if (transaction.type === 'income') {
        // https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
        balance.income += Number(transaction.value);
      } else {
        balance.outcome += Number(transaction.value);
      }
      return balance;
    });

    balance.total = balance.income - balance.outcome;

    return balance;
  }
}

export default TransactionsRepository;
