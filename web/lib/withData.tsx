import { ApolloClient } from 'apollo-client';
import Head from 'next/head';
import * as PropTypes from 'prop-types';
import * as React from 'react';
import { ApolloProvider, getDataFromTree } from 'react-apollo';
import initApollo from './initApollo';
import {NextJSPage} from './NextJSPage';
const isBrowser: boolean = !!(process as any).browser;

// Gets the display name of a JSX component for dev tools
export function getComponentDisplayName(Component: NextJSPage) {
  return Component.displayName || Component.name || 'Unknown';
}

export default (ComposedComponent: any) => {
  return class WithData extends NextJSPage {
    public static displayName = `WithData(${getComponentDisplayName(ComposedComponent)})`;
    public static propTypes = {
      serverState: PropTypes.object.isRequired,
    };

    public static async getInitialProps(ctx: any) {
      let serverState = { apollo: {} };

      const apollo = initApollo();

      // Evaluate the composed component's getInitialProps()
      let composedInitialProps = {};
      if (ComposedComponent.getInitialProps) {
        composedInitialProps = await ComposedComponent.getInitialProps({
          ...ctx,
          apollo,
        });
      }

      // Run all GraphQL queries in the component tree
      // and extract the resulting data
      if (!isBrowser) {
        // Provide the `url` prop data in case a GraphQL query uses it
        const url = { query: ctx.query, pathname: ctx.pathname};
        try {
          // Run all GraphQL queries
          await getDataFromTree(
            <ApolloProvider client={apollo}>
              <ComposedComponent {...{url, ...composedInitialProps} }/>
            </ApolloProvider>,
          );
        } catch (error) {
          // Prevent Apollo Client GraphQL errors from crashing SSR.
          // Handle them in components via the data.error prop:
          // http://dev.apollodata.com/react/api-queries.html#graphql-query-data-error
        }
        // getDataFromTree does not call componentWillUnmount
        // head side effect therefore need to be cleared manually
        Head.rewind();

        // Extract query data from the Apollo store
        serverState = {
          apollo: {
            data: apollo.cache.extract(),
          },
        };
      }

      return {
        serverState,
        ...composedInitialProps,
      };
    }

    private apollo: ApolloClient<any>;

    constructor(props: any, ctx) {
      super(props, ctx);
      this.apollo = initApollo(this.props.serverState.apollo.data);
    }

    public render() {
      return (
        <ApolloProvider client={this.apollo}>
          <ComposedComponent {...this.props} />
        </ApolloProvider>
      );
    }
  };
};
