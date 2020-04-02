import * as jwt from 'jsonwebtoken';
import { loadConfig } from 'graphql-config'
import { CRUDService } from '@graphback/runtime-knex';
import Knex = require('knex');

export interface Context {
  models: CRUDContext;
  request: any;
  db: Knex;
}

interface CRUDContext {
  [modelName: string]: CRUDService
}

export function getUserId(ctx: Context) {
  const Authorization = ctx.request.get('Authorization');
  if (Authorization) {
    const token = Authorization.replace('Bearer ', '');
    const { userId } = jwt.verify(token, process.env.APP_SECRET) as { userId: string };
    return userId;
  }

  throw new AuthError();
}

export async function getProjectConfig() {
  const config = await loadConfig({
    rootDir: process.cwd(),
    extensions: [
      () => ({ name: 'graphback' })
    ]
  });

  return config.getDefault()
}

export class AuthError extends Error {
  constructor() {
    super('Not authorized');
  }
}
