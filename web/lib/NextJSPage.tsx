import {Component} from 'react';

export abstract class NextJSPage extends Component<any, any> {
  public displayName?: string;
  public name?: string;

  public async getInitialProps(ctx: any): Promise<any> {
    return {};
  }
}
