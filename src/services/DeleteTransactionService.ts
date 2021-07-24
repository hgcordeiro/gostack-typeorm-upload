import { DeleteResult, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<DeleteResult> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const checkTransactionExists = await transactionsRepository.findOne({
      where: { id },
    });

    if (!checkTransactionExists) {
      throw new AppError('Transaction not found.');
    }

    const deleted = await transactionsRepository.delete(id);

    return deleted;
  }
}

export default DeleteTransactionService;
