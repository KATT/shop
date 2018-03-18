const withTypescript = require('@zeit/next-typescript');
module.exports = withTypescript();

if (!process.env.GRAPHQL_URL) {
  throw new Error('missing GRAPHQL_URL');
}
