import express, { Request, Response } from 'express';
import Joi from 'joi';
import { pool } from '../database';

interface Todo {
  id: number;
  description: string;
  completed: boolean;
}

const todoSchema = Joi.object({
  description: Joi.string().required(),
  completed: Joi.boolean().required(),
});

async function getTodos(): Promise<Todo[]> {
  const { rows } = await pool.query('SELECT * FROM todos ORDER BY id ASC');
  return rows;
}

async function getTodoById(id: number): Promise<Todo | null> {
  const { rows } = await pool.query('SELECT * FROM todos WHERE id = $1', [id]);
  if (rows.length) {
    return rows[0];
  } else {
    return null;
  }
}

async function createTodo(todo: Todo): Promise<Todo> {
  const { description, completed } = todo;
  const { rows } = await pool.query('INSERT INTO todos (description, completed) VALUES ($1, $2) RETURNING id', [description, completed]);
  const id = rows[0].id;
  return { id, description, completed };
}

async function updateTodoById(id: number, todo: Todo): Promise<Todo | null> {
  const { description, completed } = todo;
  const { rowCount } = await pool.query('UPDATE todos SET description = $1, completed = $2 WHERE id = $3', [description, completed, id]);
  if (rowCount) {
    return { id, description, completed };
  } else {
    return null;
  }
}

async function deleteTodoById(id: number): Promise<boolean> {
  const { rowCount } = await pool.query('DELETE FROM todos WHERE id = $1', [id]);
  return rowCount > 0;
}

const todoRouter = express.Router();

todoRouter.get('/', async (req: Request, res: Response<Todo[]>) => {
  const todos = await getTodos();
  res.send(todos);
});

todoRouter.get('/:id', async (req: Request<{ id: string }>, res: Response<Todo | string>) => {
  const id = parseInt(req.params.id);
  const todo = await getTodoById(id);
  if (todo) {
    res.send(todo);
  } else {
    res.status(404).send('Todo not found');
  }
});

todoRouter.post('/', async (req: Request<{}, {}, Todo>, res: Response<Todo | string>) => {
  try {
    const { error } = todoSchema.validate(req.body);
    if (error) {
      throw new Error(error.message);
    }
    const newTodo = await createTodo(req.body);
    res.send(newTodo);
  } catch (err: any) {
    res.status(400).send(err.message);
  }
});

todoRouter.put('/:id', async (req: Request<{ id: string }, {}, Todo>, res: Response<Todo | string>) => {
  const id = parseInt(req.params.id);
  try {
    const { error } = todoSchema.validate(req.body);
    if (error) {
      throw new Error(error.message);
    }
    const updatedTodo = await updateTodoById(id, req.body);
    if (updatedTodo) {
      res.send(updatedTodo);
    } else {
      res.status(404).send('Todo not found');
    }
  } catch (err: any) {
    res.status(400).send(err.message);
  }})