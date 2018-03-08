import gql from 'graphql-tag';
import { SingletonRouter } from 'next/router';
import { compose, graphql, QueryProps } from 'react-apollo';
import { Product } from '../lib/prisma';
import { addProductToOrderGraphQL, fragments } from '../mutations/addProductToOrder';
import ProductCard from './ProductCard';
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
  addProductToOrder: any;
  loadMoreProducts: any;
  addProductToOrderFallback;
}

function ProductSection(props: Props) {
  const {
    productsData: { loading, error, products },
    addProductToOrder,
    addProductToOrderFallback,
    url,
  } = props;

  if (error) {
    return <div>Error loading Products</div>;
  }

  return (
    <section>
      {products && <ProductList {...{products, addProductToOrder, addProductToOrderFallback, url}} />}
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
      ...GetOrderProductFragment
    }
  }
  ${fragments.Product}
`;
export default compose(
  graphql<Response, InputProps>(productsQuery, {
    name: 'productsData',
  }),
  addProductToOrderGraphQL,
)(ProductSection);
