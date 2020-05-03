// import AppError from '../errors/AppError';
import { getCustomRepository } from 'typeorm';
import TransactionRepository from '../repositories/TransactionsRepository';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionRepository = getCustomRepository(TransactionRepository);

    const checkId = await transactionRepository.findOne({
      where: { id },
    });

    if (checkId) {
      await transactionRepository.delete({ id: checkId.id });
    } else {
      throw Error('O id não foi encontrado!!');
    }
  }
}

export default DeleteTransactionService;
