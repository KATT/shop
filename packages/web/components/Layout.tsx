import { WithOrderProps } from 'lib/withOrder';
import Head from 'next/head';
import Router from 'next/router';
import { Component, Fragment, MouseEvent, ReactNode } from 'react';
import Modal from 'react-modal';
import normalizeCSS from '../lib/normalize-css';
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

export type MouseCallback = (e?: MouseEvent<HTMLElement>) => void;

export default class Layout extends Component<LayoutProps> {

  public render() {
    const {children, url, title, orderId} = this.props;
    return (
      <Fragment>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta charSet="utf-8" />
          <title>{title && `${title} | `}KATTCORP Webshop</title>
        </Head>
        <style jsx global>{`
          ${normalizeCSS}
          * { box-sizing: border-box; }
          body {
            background: #e5e5e5;
            font: 10px;
            color: #000;
            font-family: 'Roboto', sans-serif;
          }
          input[type="submit"], button {
            cursor: pointer;
          }
        `}</style>
        <Header {...{orderId, openCheckoutModal: this.openCheckoutModal}} />
        <main>
          {children}
        </main>
        <Modal
          isOpen={this.isCheckoutOpen()}
          onRequestClose={Router.back}
          >
          <Checkout orderId={this.props.orderId} url={url} />
        </Modal>
        <style jsx>{`
          main {
            padding: 2rem;
          }
        `}</style>
     </Fragment>
    );
  }
  private isCheckoutOpen(): boolean {
    return typeof this.props.url.query.checkout === 'string';
  }

  private openCheckoutModal = (e?: MouseEvent<HTMLElement>) => {
    e.preventDefault();

    Router.push(this.props.url.pathname + '?checkout', '/checkout');
  }
}
