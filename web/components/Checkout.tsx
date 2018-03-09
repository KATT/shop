import { SingletonRouter } from 'next/router';
import { graphql } from 'react-apollo';
import { APIOrder } from '../lib/prisma';
import UpdateOrderRowMutation from '../mutations/UpdateOrderRowMutation';
import { GetOrderQuery } from '../queries/GetOrderQuery';

interface InputProps {
  orderId: string;
  url: SingletonRouter;
}

interface Props extends InputProps {
  data?: {
    loading: boolean;
    order?: APIOrder
  };
}

function Checkout(props: Props) {
  const order: APIOrder = props.data.order;
  const orderRowMutationProps = {
    order,
    redirect: props.url.asPath,
  };
  return (
    <div className="Checkout">
      {props.data.loading && <div>Loading..</div>}
      {order && (
        <div>
          <ul>
            {order.rows.map((row) => (
              <li key={row.id}>
                {row.product.brand.name} {row.product.name} - quantity: {row.quantity} - total: {row.total}
                hi
                <UpdateOrderRowMutation
                  {...orderRowMutationProps}
                  variables={{id: row.id, quantity: row.quantity - 1}}
                  >
                    <input type="submit" value="-1" />
                </UpdateOrderRowMutation>
                <UpdateOrderRowMutation
                  {...orderRowMutationProps}
                  variables={{id: row.id, quantity: row.quantity + 1}}
                  >
                    <input type="submit" value="+1" />
                </UpdateOrderRowMutation>
              </li>
            ))}
          </ul>
          Order total: {order.total}
        </div>
      )}
    </div>
  );
}

export default graphql<Response, InputProps>(GetOrderQuery, {
  options: ({ orderId }) => ({
    variables: {
      id: orderId,
    },
  }),
})(Checkout);
