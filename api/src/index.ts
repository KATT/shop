// tslint:disable:no-console
import * as express from 'express';
import { createServer } from 'http';
import server from './server';

const { DB_USER, DB_PASSWORD, DB_DATABASE, DB_HOST, DB_PORT, GRAPHQL_PATH } = process.env;

async function start() {
  const app = express()

  const apolloServer = await server({
    dbConfig: {
      client: 'pg',
      connection: {
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_DATABASE,
        host: DB_HOST,
        port: parseInt(DB_PORT)
      }
    }
  });

  apolloServer.applyMiddleware({ app, path: GRAPHQL_PATH })

  const httpServer = createServer(app);
  apolloServer.installSubscriptionHandlers(httpServer);

  const port = process.env.PORT || 4000;

  httpServer.listen(
    { port },
    () => console.log(
      `> ✅  GraphQL API is running on http://localhost:${port}${GRAPHQL_PATH}`,
    ),
  )
}

try {
 start()
} catch (err) {
  console.log(err)
  process.exit(1)
}