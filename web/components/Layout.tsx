import { WithOrderProps } from 'lib/withOrder';
import Link from 'next/link';
import Router from 'next/router';
import { Component, Fragment, MouseEvent, ReactNode } from 'react';
import Modal from 'react-modal';
import Checkout from './Checkout';

const isBrowser: boolean = !!(process as any).browser;
if (isBrowser) {
  Modal.setAppElement('#__next');
}

interface LayoutProps extends WithOrderProps {
  children: ReactNode;
}

export default class Layout extends Component<LayoutProps> {

  public render() {
    const {children, url} = this.props;
    return (
      <Fragment>
        <nav>
          <Link href="/" prefetch>
            <a>Home</a>
          </Link>{' '}
          <Link href="/about" prefetch>
            <a>About</a>
          </Link>{' '}
          <Link href="/checkout" prefetch>
            <a>Checkout</a>
          </Link>{' '}

        </nav>
        <main>
          <pre>url: {JSON.stringify(this.props.url)}</pre>
          {children}

          <a href={'/checkout'}  onClick={this.clickCheckout}>
            Checkout Modal
          </a>
        </main>
        <Modal
          isOpen={this.isCheckoutOpen()}
          onRequestClose={Router.back}
          >
          <Checkout orderId={this.props.orderId} url={url} />
        </Modal>
     </Fragment>
    );
  }
  private isCheckoutOpen(): boolean {
    return typeof this.props.url.query.checkout === 'string';
  }

  private clickCheckout = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();

    Router.push(this.props.url.pathname + '?checkout', '/checkout');
  }

  private toggleCheckoutHref(): string {
    let {pathname} = this.props.url;

    if (!this.isCheckoutOpen()) {
      pathname += '?checkout';
    }

    return pathname;
  }
}
