import { Router } from 'express';
import multer from 'multer';
import { getCustomRepository, getRepository } from 'typeorm';
import uploadConfig from '../config/upload';

import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';

import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const categoriesRepository = getRepository(Category);

  const categories = await categoriesRepository.find();
  const foundTransactions = await transactionsRepository.find();
  const balance = await transactionsRepository.getBalance();

  const transactions = foundTransactions.map(transaction => {
    const {
      id,
      title,
      value,
      type,
      category_id,
      created_at,
      updated_at,
    } = transaction;

    const category = categories.find(element => element.id === category_id);

    return {
      id,
      title,
      value,
      type,
      category,
      created_at,
      updated_at,
    };
  });

  return response.json({
    transactions,
    balance,
  });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute(id);

  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransactions = new ImportTransactionsService();

    const transactions = await importTransactions.execute(request.file.path);

    return response.json(transactions);
  },
);

export default transactionsRouter;
