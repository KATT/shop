// tslint:disable:no-console

import server from './server';

const { PRISMA_DEBUG, PRISMA_ENDPOINT, PRISMA_SECRET, PORT } = process.env;

server({
  PRISMA_ENDPOINT, // the endpoint of the Prisma DB service (value is set in .env)
  PRISMA_SECRET, // taken from database/prisma.yml (value is set in .env)
  PRISMA_DEBUG: !!PRISMA_DEBUG, // log all GraphQL queries & mutations
})
  .start()
  .then(http =>
    console.log(
      `> ✅  GraphQL API Gateway is running on http://localhost:${
        http.address().port
      }`,
    ),
  )
  .catch(err => {
    console.error(`Something went wrong:`, err);
    process.exit(1);
  });
