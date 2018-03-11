import { SingletonRouter } from 'next/router';
import { Fragment } from 'react';
import { formatPrice } from '../lib/utils';
import GetOrderQuery from '../queries/GetOrderQuery';
import OrderRowList from './OrderRowList';

interface Props {
  orderId: string;
  url: SingletonRouter;
}

function Checkout({orderId, url}: Props) {
  return (
    <section className="Checkout">
      <h1>Your shopping cart</h1>

      <GetOrderQuery {...{orderId}}>{
        ({loading, order}) => (
          <Fragment>
            {loading && <div>Loading..</div>}
            {order && (
              <Fragment>
                <OrderRowList {...{order, url}} />
                <div>Order total: {formatPrice(order.subTotal)}</div>
              </Fragment>
            )}
          </Fragment>
        )
      }</GetOrderQuery>
    </section>
  );
}

export default Checkout;
