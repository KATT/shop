import { ApolloClient } from 'apollo-client';
import { SingletonRouter } from 'next/router';
import { Component } from 'react';

export interface ParsedUrlQuery {
  [key: string]: string | string[];
}
export interface NextJSPageProps {
  url: SingletonRouter;
  serverState: any;
}

export interface NextJSPageContext {
  query: ParsedUrlQuery;
  pathname: string;
  isBrowser: boolean;
  apollo: ApolloClient<any>;
  req: any;
  res: any;
}

export class NextJSPage extends Component<NextJSPageProps, any> {
  public displayName?: string;
  public name?: string;

  public async getInitialProps(ctx: any): Promise<any> {
    return {};
  }
}
