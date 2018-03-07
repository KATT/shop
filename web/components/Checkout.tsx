import { graphql } from 'react-apollo';
import { APIOrder } from '../lib/prisma';
import { GetOrderQuery } from '../queries/GetOrderQuery';

function Checkout(props) {
  const order: APIOrder = props.data.order;
  return (
    <div className="Checkout">
      {props.data.loading && <div>Loading..</div>}
      {order && (
        <div>
          <ul>
            {order.rows.map((row) => (
              <li key={row.id}>
                {row.product.brand.name} {row.product.name} - quantity: {row.quantity} - total: {row.total}
              </li>
            ))}
          </ul>
          Order total: {order.total}
        </div>
      )}
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
