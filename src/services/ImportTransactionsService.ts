import { getCustomRepository, getRepository, In } from 'typeorm';
import csvParse from 'csv-parse'; // Biblioteca que vou utilizar para manipular o arquivo csv.
import fs from 'fs'; // Que ajuda a gente a ler ou abrir o arquivo.

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const transctionRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    // Lendo nosso arquivo
    const contactsReadStream = fs.createReadStream(filePath);

    // instaciando nosso csvParse.
    const parsers = csvParse({
      // delimiter: ';',   mas ele ja vem como virgula como padrao.
      from_line: 2, // para ele comecar da linha 2 do arquivo.
    });

    const parseCSV = contactsReadStream.pipe(parsers); // vai lendo as linhas conforme elas forem disponiveis. Passando para pipe as config. CSV.

    const transctions: CSVTransaction[] = [];
    const categories: string[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map(
        (cell: string) => cell.trim(), // para tirar os espacos
      );

      // Se um deles nao existir
      if (!title || !type || !value) return;

      categories.push(category);

      transctions.push({ title, type, value, category });
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    const existentCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });

    console.log(existentCategories);

    const existentCategoriesTitle = existentCategories.map(
      (category: Category) => category.title,
    );

    // Procurar as que nao existem no banco.
    const addCategoryTitles = categories
      .filter(category => !existentCategoriesTitle.includes(category)) // traz as que nao existem no banco
      .filter((value, index, self) => self.indexOf(value) === index); // filter vai retirar o valor repetido

    // Criando Categoria no banco. Uso map para ele criar objeto de cada categoria que nao tem no banco e criar.
    const newCategories = categoriesRepository.create(
      addCategoryTitles.map(title => ({
        title,
      })),
    );

    await categoriesRepository.save(newCategories);

    // Adiciona todas as categorias no array
    const finalCategories = [...newCategories, ...existentCategories];

    const createdTransactions = transctionRepository.create(
      transctions.map(transction => ({
        title: transction.title,
        type: transction.type,
        value: transction.value,
        category: finalCategories.find(
          category => category.title === transction.category,
        ),
      })),
    );

    await transctionRepository.save(createdTransactions);

    await fs.promises.unlink(filePath); // Deletar o arquivo.

    // console.log(categories);
    // console.log(transctions);

    // return { categories, transctions };

    return createdTransactions;
  }
}

export default ImportTransactionsService;
