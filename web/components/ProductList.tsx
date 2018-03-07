import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';
import { APIOrder, APIOrderRow, Product } from '../lib/prisma';
import { GetOrderFragment, GetOrderProductFragment, GetOrderQuery } from '../queries/GetOrderQuery';

const PRODUCTS_PER_PAGE = 50;

interface ApolloResponse {
  loading: boolean;
  error: boolean;
}
interface OrderData extends ApolloResponse {
  order: APIOrder;
}
interface ProductsData extends ApolloResponse {
  products: Product[];
}

interface Props {
  orderId: string;
  orderData: OrderData;
  productsData: ProductsData;
  addProductToOrder: any;
  loadMoreProducts: any;
}

function calculateTotals(order: APIOrder) {
  const rows = order.rows.map((row) => ({
    ...row,
    total: row.quantity * row.product.price,
  }));

  const total = rows.reduce((sum, row) => sum + row.total, 0);

  return {
    ...order,
    rows,
    total,
  };
}

function addProduct(order: APIOrder, product: Product) {
  const rows = [...order.rows];
  const index = order.rows.findIndex((row) => row.product.id === product.id);

  if (index > -1) {
    const row = rows[index];
    const quantity = row.quantity + 1;
    rows[index] = {
      ...row,
      quantity,
    };
  } else {
    rows.push({
      __typename: 'OrderRow',
      id: new Date().toJSON(),
      product,
      quantity: 1,
      total: product.price,
      createdAt: new Date().toJSON(),
      updatedAt: new Date().toJSON(),
    } as APIOrderRow);
  }
  const newOrder = {
    ...order,
    rows,
  };

  return calculateTotals(newOrder);
}
function ProductList(props: Props) {
  const {
    orderId,
    orderData: { order },
    productsData: { loading, error, products },
    loadMoreProducts,
    addProductToOrder,
  } = props;

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
                  optimisticResponse: () => {
                    const rows = [];
                    return {
                      __typename: 'Mutation',
                      addProductToOrder: addProduct(order, product),
                    };
                  },
                  update: (proxy, { data: { addProductToOrder } }) => {
                    proxy.writeFragment({
                      id: orderId,
                      fragment: gql`
                        fragment OrderFragment on Order {
                          rows
                          total
                        }
                      `,
                      data: {
                        __typename: 'Order',
                        rows: addProductToOrder.rows,
                        total: addProductToOrder.total,
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
      __typename
      id
      name
      price
      ...GetOrderProductFragment
    }
  }
  ${GetOrderProductFragment}
`;

interface InputProps {
  orderId: string;
}

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
  graphql<Response, InputProps>(GetOrderQuery, {
    name: 'orderData',
    options: ({ orderId }) => ({
      variables: {
        id: orderId,
      },
    }),
  }),
  graphql<Response, InputProps>(addProductToOrder, {
    name: 'addProductToOrder',
  }),
)(ProductList);
