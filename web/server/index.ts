import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as next from 'next';

import routeGraphql from './routes/graphql';

const port = parseInt(process.env.PORT, 10) || 5000;

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    const server = express();

    server.use(cookieParser());

    server.use('/_gql', routeGraphql());

    server.get('*', (req, res) => {
      handle(req, res);
    });

    server.listen(port, (err) => {
      if (err) {
        throw err;
      }

      // tslint:disable-next-line:no-console
      console.log(`> Ready on http://localhost:${port}`);
    });
  });
