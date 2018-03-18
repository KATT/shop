import * as express from 'express';
import * as request from 'request-promise-native';

interface ReqBodyOrQuery {
  variables: object | string;
  query: string;
  redirect?: string;
  [key: string]: any;
}
interface Variables {
  [key: string]: any;
}
interface VariableOverrides {
  [key: string]: {
    type?: string;
    value?: string;
  };
}
interface Params {
  variables: Variables;
  method: string;
  query: string;
  redirect: string;
}

function parseValue(value: string, type: string) {
  if (type === 'Int') {
    return parseInt(value, 10);
  }
  if (type === 'String') {
    return value;
  }
  throw new Error(`Unknown type '${type}'`);
}

/**
 * Gets "overrides" from the default variables
 * As a browser without JS can't dynamically update the JSON we send we use this to override variables with HTML inputs
 * Example:
 *   <input name="variables:quantity:type" type="hidden" value="Int" />
 *   <input name="variables:quantity:value" type="number" min="0" step="1" value={quantity} />
 */
function getOverrides(dataSource: ReqBodyOrQuery): Variables {
  const extras: VariableOverrides = Object.keys(dataSource).reduce((result, key: string) => {
    if (key.startsWith('variables:')) {
      const [, path, valueOrType] = key.split(':');

      return {
        ...result,
        [path]: {
          ...(result[path] || {}),
          [valueOrType]: dataSource[key],
        },
      };
    }
    return result;
  }, {});

  return Object.keys(extras).reduce((res, key) => {
    const {type, value} = extras[key];
    return {...res, [key]: parseValue(value, type)};
  }, {});
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

  const overrides = getOverrides(dataSource);

  return {...variables, ...overrides};
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

    await request({
      uri: process.env.GRAPHQL_URL,
      method: 'POST',
      body: {
        query,
        variables,
      },
      json: true,
    });

    res.redirect(303, redirect);
  }));

  return router;
};
