import { GraphQLServer } from 'graphql-yoga';
import { Prisma } from './generated/prisma';
import { fragmentReplacements, resolvers } from './resolvers';

export interface ServerOptions {
  PRISMA_ENDPOINT: string;
  PRISMA_SECRET: string;
  PRISMA_DEBUG: boolean;
}

export default ({PRISMA_ENDPOINT, PRISMA_SECRET, PRISMA_DEBUG}: ServerOptions) => {
  const server = new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers,
    context: req => ({
      ...req,
      db: new Prisma({
        fragmentReplacements,
        endpoint: PRISMA_ENDPOINT, // the endpoint of the Prisma DB service (value is set in .env)
        secret: PRISMA_SECRET, // taken from database/prisma.yml (value is set in .env)
        debug: PRISMA_DEBUG, // log all GraphQL queries & mutations
      }),
    }),
  });

  return server;
};
