import { SingletonRouter } from 'next/router';
import { graphql } from 'react-apollo';
import { APIOrder } from '../lib/prisma';
import { GetOrderQuery } from '../queries/GetOrderQuery';
import OrderRowList from './OrderRowList';

interface InputProps {
  orderId: string;
  url: SingletonRouter;
}
interface Props extends InputProps {
  data?: {
    // 🚧 TODO - I'm sure there's some Apollo typedef for responses that you can extend for this
    loading: boolean;
    order?: APIOrder
  };
}

function Checkout({data: {order, loading}, url}: Props) {
  return (
    <section className="Checkout">
      <h1>Your shopping cart</h1>
      {loading && <div>Loading..</div>}
      {order && (
        <div>
          <OrderRowList {...{order, url}} />
          Order total: {order.total}
        </div>
      )}
    </section>
  );
}

export default graphql<Response, InputProps>(GetOrderQuery, {
  options: ({ orderId }) => ({
    variables: {
      id: orderId,
    },
  }),
})(Checkout);
