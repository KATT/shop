import gql from 'graphql-tag';
import { SingletonRouter } from 'next/router';
import { compose, graphql, QueryProps } from 'react-apollo';
import { Product } from '../lib/prisma';
import { addProductToOrderGraphQL, fragments } from '../mutations/addProductToOrder';
import ProductCard from './ProductCard';

interface ProductsData extends QueryProps {
  products: Product[];
}

interface InputProps {
  orderId: string;
  url: SingletonRouter;
}

interface Props extends InputProps {
  products: ProductsData;
  addProductToOrder: any;
  loadMoreProducts: any;
  addProductToOrderFallback;
}

function ProductList(props: Props) {
  const {
    products: { loading, error, products },
    addProductToOrder,
    addProductToOrderFallback,
    url,
  } = props;

  if (error) {
    return <div>Error loading Products</div>;
  }

  return (
    <section>
      {products && products.length && (
        <ul>
          {products.map((product: any) => {
            const fallback = addProductToOrderFallback(product, url.asPath);
            return <ProductCard {...{fallback, product, addProductToOrder}} />;
          })}
        </ul>
      )}
      <style jsx>{`
        section {
          padding-bottom: 20px;
        }
        li {
          display: block;
          margin-bottom: 10px;
        }
        div {
          align-items: center;
          display: flex;
        }
        a {
          font-size: 14px;
          margin-right: 10px;
          text-decoration: none;
          padding-bottom: 0;
          border: 0;
        }
        span {
          font-size: 14px;
          margin-right: 5px;
        }
        ul {
          margin: 0;
          padding: 0;
        }
        button:before {
          align-self: center;
          border-style: solid;
          border-width: 6px 4px 0 4px;
          border-color: #ffffff transparent transparent transparent;
          content: "";
          height: 0;
          margin-right: 5px;
          width: 0;
        }
      `}</style>
    </section>
  );
}

const productsQuery: any = gql`
  query products {
    products(orderBy: createdAt_DESC) {
      __typename
      id
      name
      price
      ...GetOrderProductFragment
    }
  }
  ${fragments.Product}
`;
export default compose(
  graphql<Response, InputProps>(productsQuery, {
    name: 'products',
  }),
  addProductToOrderGraphQL,
)(ProductList);
