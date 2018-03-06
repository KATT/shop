import server from './server';

const {
  PRISMA_DEBUG,
  PRISMA_ENDPOINT,
  PRISMA_SECRET,
  PORT,
} = process.env;

server({
  PRISMA_ENDPOINT, // the endpoint of the Prisma DB service (value is set in .env)
  PRISMA_SECRET, // taken from database/prisma.yml (value is set in .env)
  PRISMA_DEBUG: !!PRISMA_DEBUG, // log all GraphQL queries & mutations

  // tslint:disable-next-line:no-console
}).start(() => console.log(`Server is running on http://localhost:${PORT}`));
