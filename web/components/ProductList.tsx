import gql from 'graphql-tag';
import { SingletonRouter } from 'next/router';
import { compose, graphql, QueryProps } from 'react-apollo';
import { Product } from '../lib/prisma';
import { addProductToOrderGraphQL, fragments } from '../mutations/addProductToOrder';
const PRODUCTS_PER_PAGE = 50;

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
  addProductToOrderTest;
  addProductToOrderFallback;
}

function ProductList(props: Props) {
  const {
    productsData: { loading, error, products },
    loadMoreProducts,
    addProductToOrder,
    addProductToOrderFallback,
    url,
  } = props;

  if (error) { return <div>Error loading Products</div>; }
  if (products && products.length) {
    const areMoreProducts = true;
    return (
      <section>
        <ul>
          {products.map((product: any) => {
            const fallback = addProductToOrderFallback(product, url.asPath);
            return (
              <li key={product.id}>
                {product.name}:  {' '}
                <a href={`/_gql/m/?${fallback.stringified}`}>Add to order (link)</a>
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
          })}
        </ul>
        {areMoreProducts ?
          <button onClick={() => loadMoreProducts()}> {
            loading ? 'Loading...' : 'Show More'
          } </button> : ''}
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
  return <div>Loading</div>;
}

const productsQuery: any = gql`
  query products($first: Int!, $skip: Int!) {
    products(orderBy: createdAt_DESC, first: $first, skip: $skip) {
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
    options: {
      variables: {
        skip: 0,
        first: PRODUCTS_PER_PAGE,
      },
    },
    props: ({ productsData }: any) => ({
      productsData,
      loadMoreProducts: () => {
        return productsData.fetchMore({
          variables: {
            skip: productsData.products.length,
          },
          updateQuery: (previousResult: any, { fetchMoreResult }: any) => {
            if (!fetchMoreResult) {
              return previousResult;
            }
            return Object.assign({}, previousResult, {
              // Append the new Products results to the old one
              products: [...previousResult.products, ...fetchMoreResult.products],
            });
          },
        });
      },
    }),
  }),
  addProductToOrderGraphQL,
)(ProductList);
