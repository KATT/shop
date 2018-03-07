import * as express from 'express';
import * as next from 'next';

const port = parseInt(process.env.PORT, 10) || 5000;

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    const server = express();

    server.get('/cat/talk', (req, res) => {
      res.send('meow');
    });

    server.get('*', (req, res) => {
      return handle(req, res);
    });

    server.listen(port, (err) => {
      if (err) {
        throw err;
      }

      // tslint:disable-next-line:no-console
      console.log(`> Ready on http://localhost:${port}`);
    });
  });
