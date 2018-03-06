import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';
import { GetOrderFragment } from '../queries/GetOrderQuery';

const PRODUCTS_PER_PAGE = 50;

function ProductList(props: any) {
  const { orderId, data: { loading, error, products }, loadMoreProducts, addProductToOrder } = props;

  if (error) { return <div>Error loading Products</div>; }
  if (products && products.length) {
    const areMoreProducts = true;
    return (
      <section>
        <ul>
          {products.map((product: any, index: number) =>
            <li key={product.id}>
              {product.name}: {' '}
              <button onClick={() => addProductToOrder({
                  variables: {
                    orderId,
                    productId: product.id,
                  },
                  update: (proxy, { data: { addProductToOrder } }) => {
                    proxy.writeFragment({
                      id: orderId,
                      fragment: gql`
                        fragment OrderFragment on Order {
                          products
                        }
                      `,
                      data: {
                        __typename: 'Order',
                        products: addProductToOrder.products,
                      },
                    });
                  },
                })
              }>Add to order</button>
            </li>,
          )}
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

const addProductToOrder: any = gql`
  mutation addProductToOrder ($orderId: String! $productId: String! $quantity: Int) {
    addProductToOrder (orderId: $orderId productId: $productId quantity: $quantity) {
      ...GetOrderFragment
    }
  }
  ${GetOrderFragment}
`;

const productsQuery: any = gql`
  query products($first: Int!, $skip: Int!) {
    products(orderBy: createdAt_DESC, first: $first, skip: $skip) {
      id
      name
    },
  }
`;

interface InputProps {
  orderId: string;
}

export default compose(
    graphql<Response, InputProps>(productsQuery, {
    options: {
      variables: {
        skip: 0,
        first: PRODUCTS_PER_PAGE,
      },
    },
    props: ({ data }: any) => ({
      data,
      loadMoreProducts: () => {
        return data.fetchMore({
          variables: {
            skip: data.products.length,
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
  graphql<Response, InputProps>(addProductToOrder, {
    name: 'addProductToOrder',
  }),
)(ProductList);
