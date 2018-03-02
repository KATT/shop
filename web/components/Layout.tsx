import Link from 'next/link';
import Router from 'next/router';
import {Component, Fragment, ReactNode, SyntheticEvent} from 'react';
import { UrlWithParsedQuery } from 'url';
import Checkout from './Checkout';

interface LayoutProps {
  children: ReactNode;
  url: UrlWithParsedQuery;
}

export default class Layout extends Component<LayoutProps> {

  public render() {
    const {children} = this.props;
    return (
      <Fragment>
        <nav>
          <Link href="/" prefetch>
            <a>Home</a>
          </Link>{' '}
          <Link href="/about" prefetch>
            <a>About</a>
          </Link>{' '}

          <Link href={this.toggleCheckoutHref()}>
            <a id="checkout-link">{this.isCheckoutOpen() ? 'Close' : 'Go to'} Checkout</a>
          </Link>
        </nav>
        <main>
          {children}
          <pre>{JSON.stringify(this.props.url)}</pre>
        </main>
        {this.isCheckoutOpen() && <Checkout />}
     </Fragment>
    );
  }
  private isCheckoutOpen(): boolean {
    return typeof this.props.url.query.checkout === 'string';
  }

  private toggleCheckoutHref(): string {
    let {pathname} = this.props.url;

    if (!this.isCheckoutOpen()) {
      pathname += '?checkout';
    }

    return pathname;
  }
}
