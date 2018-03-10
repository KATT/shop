import { SingletonRouter } from 'next/router';
import { APIOrder } from '../lib/prisma';
import UpdateOrderRowMutation, {Props as UpdateOrderRowMutationProps} from '../mutations/UpdateOrderRowMutation';

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
          {' '}<span aria-label={`Quantity: ${quantity}`}>{quantity}</span>{' '}
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
