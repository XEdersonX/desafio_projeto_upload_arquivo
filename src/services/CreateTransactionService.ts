// import AppError from '../errors/AppError';

import { getRepository, getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const categoryRepository = getRepository(Category);

    let idCategory = '';

    const checkCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!checkCategory) {
      const categoryNew = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(categoryNew);

      idCategory = categoryNew.id;
    } else {
      idCategory = checkCategory.id;
    }

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const { total } = await transactionsRepository.getBalance();

    console.log(`🚀 { ${total} }`);

    if (type === 'outcome' && value > total) {
      // throw Error(
      //   'A transação do tipo outcome extrapole o valor total que o usuário tem em caixa',
      // );
      throw new AppError(
        'A transação do tipo outcome extrapole o valor total que o usuário tem em caixa',
        400,
      );
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: idCategory,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
