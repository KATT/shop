import * as bodyParser from 'body-parser';
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
    server.use(bodyParser.urlencoded({extended: false}));

    server.use('/_gql', routeGraphql());
    server.get('*', (req, res, callback) => {
      if (req.query.hasOwnProperty('clearOrderId')) {
        res.clearCookie('orderId');
        res.redirect(303, '/') ;
        return;
      }
      callback();
    });
    server.get('*', (req, res) => {
      handle(req, res);
    });

    server.listen(port, (err) => {
      if (err) {
        throw err;
      }

      // tslint:disable-next-line:no-console
      console.log(`> ✅  Web App is running on http://localhost:${port}`);
    });
  });
