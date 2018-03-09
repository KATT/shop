
import Link from 'next/link';
import { Fragment } from 'react';
import GetOrderQuery from '../queries/GetOrderQuery';
import { MouseCallback } from './Layout';

const navItemsHeight = '3rem';

interface Props {
  orderId: string;
  openCheckoutModal: MouseCallback;
}

export default ({orderId, openCheckoutModal}) => (
  <Fragment>
    <header>
      <nav>
        <Link href="/" prefetch>
          <a>Home</a>
        </Link>{' '}
        <Link href="/about" prefetch>
          <a>About</a>
        </Link>{' '}
        <a href="/checkout" onClick={openCheckoutModal}>
          Checkout
          <GetOrderQuery {...{orderId}}>{
            ({order}) => order && <Fragment>{` (${order.total})`}</Fragment>}
          </GetOrderQuery>
        </a>
      </nav>
    </header>
    <div className="placeholder" />
    <style jsx>{`
      a {
        display: inline-block;
        padding: 0 1rem;
        text-decoration: none;
        background: rgba(255, 255, 255, 0.1);
        color: white;
        font-size: 1.2rem;
        line-height: ${navItemsHeight};

        transition: background 0.3s ease-out;
      }
      a:hover {
        background: rgba(255, 255, 255, 0.3);
      }
      a:focus {
        background: rgba(255, 255, 255, 0.4);
      }
      a:not(:last-child) {
        margin-right: 1rem;
      }
      header {
        position: fixed;
        top: 0;
        background: black;
        width: 100%;
        padding: 0 2rem;
      }
      .placeholder {
        height: ${navItemsHeight};
        visibility: hidden;
      }
    `}</style>
  </Fragment>
);
