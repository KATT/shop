import gql from 'graphql-tag';
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

export const ProductCardFragment = gql`
  fragment ProductCardFragment on Product {
    name
    price
    thumbnail
  }
`;

export default ({product, fallback, addProductToOrder}: Props) => (
  <article className="ProductCard" itemProp="itemListElement" itemScope itemType="http://schema.org/Product">
    <div className="image">
      <img src={product.thumbnail} alt={product.name} itemProp="image" />
    </div>
    <div itemProp="name">{product.name}</div>
    <div itemProp="offers" itemScope itemType="http://schema.org/Offer">
      <span itemProp="price">{formatPrice(product.price)}</span>
    </div>

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
    <style jsx>{`
      article {
        padding: 2%;
        flex-grow: 1;
        flex-basis: 20%;
        background: white;
      }
      @media (max-width: 920px) {
        article {
          flex: 1 21%;
        }
      }
      section {
      }
      img {
        max-width: 100%;
      }
      .info {
        margin-top: auto;
      }
      button {
        display: block;
        width: 100%
        padding: 5px;
      }
    `}</style>
  </article>
);
