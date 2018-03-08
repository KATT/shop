import gql from 'graphql-tag';
import {print as printSource} from 'graphql/language/printer';
import qs from 'querystring';
import { compose, graphql, QueryProps } from 'react-apollo';
import { APIOrder, APIOrderRow, Product } from '../lib/prisma';
import { GetOrderFragment, GetOrderProductFragment, GetOrderQuery } from '../queries/GetOrderQuery';
export interface OrderData extends QueryProps {
  order: APIOrder;
}

export interface InputProps {
  orderId: string;
}

export function calculateTotals(order: APIOrder) {
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

export function addProductReducer(order: APIOrder, product: Product): APIOrder {
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
      order,
    } as APIOrderRow);
  }
  const newOrder = {
    ...order,
    rows,
  };

  return calculateTotals(newOrder);
}

export const addProductToOrderQuery: any = gql`
  mutation addProductToOrder ($orderId: String! $productId: String! $quantity: Int) {
    addProductToOrder (orderId: $orderId productId: $productId quantity: $quantity) {
      order {
        ...GetOrderFragment
      }
    }
  }
  ${GetOrderFragment}
`;

export const addProductToOrderGraphQL = compose(
  graphql<Response, InputProps>(GetOrderQuery, {
    name: 'orderData',
    options: ({ orderId }) => ({
      variables: {
        id: orderId,
      },
    }),
  }),
  graphql<Response, InputProps>(addProductToOrderQuery, {
    name: 'addProductToOrder',
    props: (props: any) => ({
      addProductToOrderFallback: (product: Product, redirect: string) => {
        const {orderId} = props.ownProps;

        const query = printSource(addProductToOrderQuery);
        const variables = {
          orderId,
          productId: product.id,
        };

        const stringified = qs.stringify({
          query,
          variables: JSON.stringify(variables),
          redirect,
        });

        return {query, variables, redirect, stringified};
      },
      addProductToOrder: (product: Product) => {
        const {order} = props.ownProps.orderData;
        return (props as any).addProductToOrder({
          variables: {
            orderId: order.id,
            productId: product.id,
          },
          optimisticResponse: () => {
            return {
              __typename: 'Mutation',
              addProductToOrder: {
                __typename: 'OrderRow',
                order: addProductReducer(order, product),
              },
            };
          },
        });
      },
    }),
  }),
);

export const fragments = {
  Product: GetOrderProductFragment,
};
