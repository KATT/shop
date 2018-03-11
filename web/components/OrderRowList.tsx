import { SingletonRouter } from 'next/router';
import { APIOrder } from '../lib/prisma';
import { formatPrice } from '../lib/utils';
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
      {rows.map(({id, quantity, total, product: {name, brand, thumbnail}}) => (
        <article key={id} itemProp="itemListElement" itemScope itemType="http://schema.org/Product">
          <div className="image">
            <img src={thumbnail} alt={`${name} picture`} />
          </div>
          <div className="description">
            <div>{name}</div>
            <div>By: {brand.name}</div>
          </div>

          <div className="quantity">
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
            <UpdateOrderRowMutation
              {...orderRowMutationProps}
              variables={{id, quantity: quantity + 1}}
              >
              <input type="submit" value="+" aria-label={`Add 1 ${name} to cart`} />
            </UpdateOrderRowMutation>
          </div>
          <div className="total-price">{formatPrice(total)}</div>
          <div className="delete">
            <UpdateOrderRowMutation
              {...orderRowMutationProps}
              variables={{id, quantity: 0}}
              >
              <input type="submit" value="x" aria-label={`Delete ${name} from cart`} />
            </UpdateOrderRowMutation>
          </div>
        </article>
      ))}
      <style jsx>{`
        article {
          display: flex;
          flex-wrap: wrap;
        }
        ul {
          padding-left: 0;
          padding-right: 0;
          display: flex;
          flex-direction: column;
        }
        article {
          display: flex;
          justify-content: space-between;
        }
        article > div {
          flex: 1;
          padding: 1rem;
        }
        .image {
          max-width: 10%;
        }
        img {
          max-width: 100%;
        }

        input[type='submit'] {
          background: navy;
          color: white;
          border: none;
          padding: 0.2rem;
          width: 2rem;
        }
      `}</style>
    </ul>
  );
}

export default OrderRowList;
