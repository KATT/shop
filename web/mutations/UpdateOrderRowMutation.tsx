import gql from 'graphql-tag';
import { print as printSource } from 'graphql/language/printer';
import React, { ReactNode } from 'react';
import { graphql } from 'react-apollo';
import { Order, UpdateOrderRowVariables } from '../lib/prisma';
import { GetOrderFields } from '../queries/GetOrderQuery';
import { calculateTotals } from './AddProductToOrderMutation';

type updateOrderRowMutationFn = (variables: UpdateOrderRowVariables) => {};

interface RenderCallbackProps {
  updateOrderRowMutation: updateOrderRowMutationFn;
}

type RenderCallback = (props: RenderCallbackProps) => JSX.Element;

export interface Props {
  className?: string;
  children: ReactNode | RenderCallback;
  order: Partial<Order>;
  variables: UpdateOrderRowVariables;
  redirect: string;
  updateOrderRowMutation?: updateOrderRowMutationFn;
  style?;
}

export function orderReducerUpdateOrderRow(
  order: Partial<Order>,
  variables: UpdateOrderRowVariables,
) {
  const newOrder = {
    ...order,
    rows: order.rows.reduce((rows, row) => {
      if (row.id !== variables.id) {
        return [...rows, row];
      }
      if (variables.quantity < 1) {
        // row deleted!
        return rows;
      }
      return [...rows, { ...row, ...variables }];
    }, []),
  };

  return calculateTotals(newOrder);
}

export const updateOrderRowQuery: any = gql`
  mutation updateOrderRow ($id: ID! $quantity: Int) {
    updateOrderRow (id: $id quantity: $quantity) {
      order {
        ${GetOrderFields}
      }
    }
  }
`;
const updateOrderRowQueryString = printSource(updateOrderRowQuery);

function isFunction(obj: any) {
  return typeof obj === 'function';
}

export const UpdateOrderRow = ({
  children,
  redirect,
  variables,
  updateOrderRowMutation,
  style,
}: Props) => (
  <form
    action={'/_gql/m'}
    style={style}
    method="post"
    onSubmit={e => {
      e.preventDefault();

      updateOrderRowMutation(variables);
    }}
  >
    <input type="hidden" name="query" value={updateOrderRowQueryString} />
    <input type="hidden" name="redirect" value={redirect} />
    <input type="hidden" name="variables" value={JSON.stringify(variables)} />
    {isFunction(children)
      ? (children as RenderCallback)({ updateOrderRowMutation })
      : children}
  </form>
);

export const updateOrderRowGraphQL = graphql<Response, Props>(
  updateOrderRowQuery,
  {
    props: props => ({
      updateOrderRowMutation: (variables: UpdateOrderRowVariables) => {
        const { order } = props.ownProps;
        return props.mutate({
          variables,
          optimisticResponse: {
            __typename: 'Mutation',
            updateOrderRow: {
              __typename: 'OrderRow',
              order: orderReducerUpdateOrderRow(order, variables),
            },
          },
        });
      },
    }),
  },
);

export default updateOrderRowGraphQL(UpdateOrderRow);
