import { ApolloServer, PubSub } from 'apollo-server-express';
import { createKnexPGCRUDRuntimeServices } from '@graphback/runtime-knex';
import { models } from './resolvers/models';
import resolvers from './resolvers/resolvers';
import { getProjectConfig } from './utils';
import * as Knex from 'knex';

export interface ServerOptions {
  dbConfig: Knex.Config
}

export default async ({ dbConfig }: ServerOptions) => {
  const projectConfig = await getProjectConfig();
  const typeDefs = await projectConfig.getSchema('DocumentNode');
  const schema = await projectConfig.getSchema();
  const db = Knex(dbConfig);
  const pubSub = new PubSub();
  const services = createKnexPGCRUDRuntimeServices(models, schema, db, pubSub)

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: context => ({
      ...context,
      ...services
    }),
  });

  return server;
};
