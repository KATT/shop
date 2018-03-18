import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import * as fetch from 'isomorphic-fetch';

export let apolloClient: ApolloClient<any> ;

const isBrowser: boolean = !!(process as any).browser;

// Polyfill fetch() on the server (used by apollo-client)
if (!isBrowser) {
  (global as any).fetch = fetch;
}

function create(initialState: any) {
  return new ApolloClient({
    connectToDevTools: isBrowser,
    ssrMode: !isBrowser, // Disables forceFetch on the server (so queries are only run once)
    link: new HttpLink({
      uri: process.env.GRAPHQL_URL, // Server URL (must be absolute)
      // opts: {
      //   // Additional fetch() options like `credentials` or `headers`
      //   credentials: 'same-origin',
      // },
    }),
    cache: new InMemoryCache().restore(initialState || {}),
  });
}

export default function initApollo(initialState?: any) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (!isBrowser) {
    return create(initialState);
  }

  // Reuse client on the client-side
  if (!apolloClient) {
    apolloClient = create(initialState);
  }

  return apolloClient;
}
