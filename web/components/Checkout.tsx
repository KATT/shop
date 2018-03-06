import { graphql } from 'react-apollo';
import { Cart } from '../lib/prisma';
import { GetCartQuery } from '../queries/GetCartQuery';

function Checkout(props) {
  const cart: Cart = props.data.cart;
  return (
    <div className="Checkout">
      {props.data.loading && <div>Loading..</div>}
      {cart && <ul>
        {cart.products.map((row) => (
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
  cartId: string;
}
export default graphql<Response, InputProps>(GetCartQuery, {
  options: ({ cartId }) => ({
    variables: {
      id: cartId,
    },
  }),
})(Checkout);
