import { Product } from 'lib/prisma';
import { AddProductToOrderNoJSProps } from 'mutations/addProductToOrder';

interface Props  {
  product: Product;

  fallback: AddProductToOrderNoJSProps;

  addProductToOrder: (product: Product) => {};
}

function formatPrice(price: number) {
  return Math.round(price / 100) + ' SEK';
}

export default ({product, fallback, addProductToOrder}: Props) => (
  <li>
    {product.name} - {formatPrice(product.price)}
    <form
      action={'/_gql/m'}
      method="post"
      onSubmit={(e) => e.preventDefault() && addProductToOrder(product)}
      >
        <input type="hidden" name="redirect" value={fallback.redirect} />
        <input type="hidden" name="query" value={fallback.query} />
        <input type="hidden" name="variables" value={JSON.stringify(fallback.variables)} />
        <button type="submit" onClick={() => addProductToOrder(product)}>Add to order</button>
    </form>
  </li>
);
