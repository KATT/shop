import {Component} from 'react';
import { UrlWithParsedQuery } from 'url';

interface NextJSPageProps {
  url: UrlWithParsedQuery;
}

export class NextJSPage extends Component<NextJSPageProps, any> {
  public displayName?: string;
  public name?: string;

  public async getInitialProps(ctx: any): Promise<any> {
    return {};
  }
}
