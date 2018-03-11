import { SingletonRouter } from 'next/router';
import { Fragment } from 'react';
import { APIOrder } from '../lib/prisma';
import UpdateOrderRowMutation from '../mutations/UpdateOrderRowMutation';
import OrderRowQuantityInput from './OrderRowQuantityInput';

interface Props {
  order: Partial<APIOrder>;
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
    style: {
      display: 'inline-block',
    },
  };

  return (
    <ul>
      {rows.map(({id, quantity, total, product: {name, brand}}) => (
        <li key={id} itemProp="itemListElement" itemScope itemType="http://schema.org/Product">
          {brand.name} {name}
          <UpdateOrderRowMutation
            {...orderRowMutationProps}
            variables={{id, quantity: quantity - 1}}
            >
              <input type="submit" value="-" aria-label={`Remove 1 ${name} from cart`} />
          </UpdateOrderRowMutation>

          <UpdateOrderRowMutation
            {...orderRowMutationProps}
            variables={{id, quantity}}
            >{({updateOrderRowMutation}) => (
              <OrderRowQuantityInput quantity={quantity} onChange={(newQuantity) => {
                updateOrderRowMutation({
                  id,
                  quantity: newQuantity,
                });
              }} />
            )}</UpdateOrderRowMutation>
          {' '}
          <UpdateOrderRowMutation
            {...orderRowMutationProps}
            variables={{id, quantity: quantity + 1}}
            >
            <input type="submit" value="+" aria-label={`Add 1 ${name} to cart`} />
          </UpdateOrderRowMutation>
          - total: {total}
        </li>
      ))}
    </ul>
  );
}

export default OrderRowList;
