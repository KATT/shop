import { graphql } from 'react-apollo';
import { Order } from '../lib/prisma';
import { GetOrderQuery } from '../queries/GetOrderQuery';

function Checkout(props) {
  const order: Order = props.data.order;
  return (
    <div className="Checkout">
      {props.data.loading && <div>Loading..</div>}
      {order && <ul>
        {order.rows.map((row) => (
          <li key={row.id}>
            {row.product.brand.name} {row.product.name} - quantity: {row.quantity}
          </li>
        ))}
      </ul>
      }
    </div>
  );
}

interface InputProps {
  orderId: string;
}
export default graphql<Response, InputProps>(GetOrderQuery, {
  options: ({ orderId }) => ({
    variables: {
      id: orderId,
    },
  }),
})(Checkout);
