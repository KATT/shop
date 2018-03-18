import gql from 'graphql-tag';
import { SingletonRouter } from 'next/router';
import { graphql, QueryProps } from 'react-apollo';
import { Product } from '../lib/prisma';
import { GetOrderProductFields } from '../queries/GetOrderQuery';
import { ProductCardFragment } from './ProductCard';
import ProductList from './ProductList';

interface ProductsData extends QueryProps {
  products: Product[];
}

interface InputProps {
  orderId: string;
  url: SingletonRouter;
}

interface Props extends InputProps {
  productsData: ProductsData;
  loadMoreProducts: any;
}

function ProductSection(props: Props) {
  const {
    productsData: { loading, error, products },
    url,
    orderId,
  } = props;

  if (error) {
    return <div>Error loading Products</div>;
  }

  return (
    <section>
      {products && <ProductList {...{products, url, orderId}} />}
      <style jsx>{`
        section {
          padding-bottom: 20px;
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
      ...ProductCardFragment
      ${GetOrderProductFields}
    }
  }
  ${ProductCardFragment}
`;
export default graphql<Response, InputProps>(productsQuery, {
  name: 'productsData',
})(ProductSection);
