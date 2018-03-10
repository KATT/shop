import { SingletonRouter } from 'next/router';
import { Fragment } from 'react';
import { graphql } from 'react-apollo';
import { APIOrder } from '../lib/prisma';
import GetOrderQuery, {GetOrderQueryAST} from '../queries/GetOrderQuery';
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
              <div>
                <OrderRowList {...{order, url}} />
                <div>Order total: {order.total}</div>
              </div>
            )}
          </Fragment>
        )
      }</GetOrderQuery>
    </section>
  );
}

export default Checkout;
