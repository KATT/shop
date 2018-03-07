import * as express from 'express';
import {DocumentNode} from 'graphql';
import * as request from 'request-promise-native';

interface ReqBodyOrQuery {
  variables: object | string;
  query: string;
  redirect?: string;
}
interface Variables {
  [key: string]: any;
}
interface Params {
  variables: Variables;
  method: string;
  query: string;
  redirect: string;
}

function getVariables(dataSource: ReqBodyOrQuery): Variables {
  let variables: any = dataSource.variables || {};
  if (typeof variables === 'string') {
    try {
      variables = JSON.parse(variables);
    } catch (e) {
      throw new Error('"variables" not valid JSON');
    }
  }

  return variables;
}

function getParams(req: express.Request): Params {
  const {method} = req;
  if (!['GET', 'POST', 'PATCH'].includes(method)) {
    throw new Error(`Unsupported method ${method}`);
  }

  const dataSource: ReqBodyOrQuery = method === 'GET' ? req.query : req.body;

  const {query, redirect = '/'} = dataSource;
  const variables = getVariables(dataSource);

  return {
    method,
    variables,
    query,
    redirect,
  };
}

function asyncMiddleware(handler: express.RequestHandler): express.RequestHandler {
  const fn: express.RequestHandler = async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (e) {
      next(e);
    }
  };

  return fn;
}

// 🚧 TODO - dependency injection
export default () => {
  const router = express.Router();

  router.all('/m/', asyncMiddleware(async (req, res) => {
    const {query, variables, redirect} = getParams(req);

    const response = await request({
      uri: process.env.GRAPHQL_URL,
      method: 'POST',
      body: {
        query,
        variables,
      },
      json: true,
    });

    res.redirect(303, redirect);
    // res.send({response, query, variables, redirect});
  }));

  return router;
};
