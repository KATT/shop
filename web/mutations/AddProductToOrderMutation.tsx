import { getOrderWithTotals } from '@katt/shop-lib';
import gql from 'graphql-tag';
import { print as printSource } from 'graphql/language/printer';
import React, { ReactNode } from 'react';
import { compose, graphql } from 'react-apollo';
import { Order, OrderRow, Product } from '../lib/prisma';
import { GetOrderFields, GetOrderQueryAST } from '../queries/GetOrderQuery';

type addProductToOrderMutationFn = (product: Product) => {};

interface RenderCallbackProps {
  addProductToOrderMutation: addProductToOrderMutationFn;
}

type RenderCallback = (props: RenderCallbackProps) => JSX.Element;

interface InputProps {
  children: ReactNode | RenderCallback;
  orderId: string;
  productId: string;
  redirect: string;
  product: Product;
}

interface Props extends InputProps {
  order: Partial<Order>;
  addProductToOrderMutation?: addProductToOrderMutationFn;
  style?;
}

function isFunction(obj: any) {
  return typeof obj === 'function';
}

export function addProductToOrderReducer(
  order: Partial<Order>,
  product: Product,
): Partial<Order> {
  const rows = [...order.rows];
  const index = order.rows.findIndex(row => row.product.id === product.id);

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
    } as OrderRow);
  }
  const newOrder = {
    ...order,
    rows,
  };

  return getOrderWithTotals(newOrder);
}

export const AddProductToOrder = ({
  addProductToOrderMutation,
  children,
  orderId,
  product,
  productId,
  redirect,
}: Props) => (
  <form
    action={'/_gql/m'}
    method="post"
    onSubmit={e => {
      e.preventDefault();

      addProductToOrderMutation(product);
    }}
  >
    <input type="hidden" name="redirect" value={redirect} />
    <input type="hidden" name="query" value={AddProductToOrderASTString} />
    <input
      type="hidden"
      name="variables"
      value={JSON.stringify({ orderId, productId })}
    />
    {isFunction(children)
      ? (children as RenderCallback)({ addProductToOrderMutation })
      : children}
  </form>
);

export const AddProductToOrderAST: any = gql`
  mutation addProductToOrder ($orderId: String! $productId: String! $quantity: Int) {
    addProductToOrder (orderId: $orderId productId: $productId quantity: $quantity) {
      order {
        ${GetOrderFields}
      }
    }
  }
`;
const AddProductToOrderASTString = printSource(AddProductToOrderAST);

export const AddProductToOrderMutation = compose(
  graphql<Response, InputProps>(GetOrderQueryAST, {
    name: 'orderData',
    options: ({ orderId }) => ({
      variables: {
        id: orderId,
      },
    }),
  }),
  graphql<Response, InputProps>(AddProductToOrderAST, {
    name: 'addProductToOrder',
    props: (props: any) => ({
      addProductToOrderMutation: (product: Product) => {
        const { order } = props.ownProps.orderData;
        const variables = {
          orderId: order.id,
          productId: product.id,
        };
        return props.addProductToOrder({
          variables,
          optimisticResponse: () => {
            return {
              __typename: 'Mutation',
              addProductToOrder: {
                __typename: 'OrderRow',
                order: addProductToOrderReducer(order, product),
              },
            };
          },
        });
      },
    }),
  }),
)(AddProductToOrder);

export default AddProductToOrderMutation;
