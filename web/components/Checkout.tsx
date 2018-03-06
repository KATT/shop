import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';
import { GetCartQuery } from '../queries/GetCartQuery';

function Checkout(props) {
  return (
    <div className="Checkout">
      I'm the contents of the Checkout Modal!

      <pre>cart: {JSON.stringify(props, null, 4)}</pre>
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
