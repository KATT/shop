import { WithOrderProps } from 'lib/withOrder';
import Head from 'next/head';
import Router from 'next/router';
import style from 'next/style';
import { Component, Fragment, MouseEvent, ReactNode } from 'react';
import Modal from 'react-modal';
import Checkout from './Checkout';
import Header from './Header';

const isBrowser: boolean = !!(process as any).browser;
if (isBrowser) {
  Modal.setAppElement('#__next');
}

interface LayoutProps extends WithOrderProps {
  children: ReactNode;
  title?: string;
}

export default class Layout extends Component<LayoutProps> {

  public render() {
    const {children, url, title} = this.props;
    return (
      <Fragment>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta charSet="utf-8" />
          <title>{title && `${title} | `}KATTCORP Webshop</title>
        </Head>
        <style jsx global>{`
          body {
            background: #e5e5e5;
            font: 10px;
            color: #000;
          }
        `}</style>
        <Header />
        <main>
          <pre>url: {JSON.stringify(this.props.url)}</pre>
          <a href={'/checkout'}  onClick={this.clickCheckout}>
            Checkout Modal
          </a>
          {children}
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
