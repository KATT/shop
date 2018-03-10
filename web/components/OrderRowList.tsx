import gql from 'graphql-tag';
import { SingletonRouter } from 'next/router';
import { compose, graphql } from 'react-apollo';
import { APIOrder } from '../lib/prisma';
import { addProductToOrderGraphQL, fragments } from '../mutations/addProductToOrder';
import UpdateOrderRowMutation from '../mutations/UpdateOrderRowMutation';
import { ProductCardFragment } from './ProductCard';

interface Props {
  order: APIOrder;
  url: SingletonRouter;
}

function OrderRowList(props: Props) {
  const {
    order,
    url,
  } = props;
  const {rows} = order;

  const orderRowMutationProps = {
    order,
    redirect: url.asPath,
  };

  return (
    <ul>
      {rows.map((row) => (
        <li key={row.id}>
          {row.product.brand.name} {row.product.name} - quantity: {row.quantity} - total: {row.total}
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
  );
}

export default OrderRowList;
