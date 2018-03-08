import gql from 'graphql-tag';
import {print as printSource} from 'graphql/language/printer';
import { APIOrder, APIOrderRow, ID_Input } from 'lib/prisma';
import React, { ReactNode } from 'react';
import { compose, graphql, QueryProps } from 'react-apollo';
import { GetOrderFragment } from '../queries/GetOrderQuery';
import { calculateTotals } from './addProductToOrder';

interface UpdateOrderRowVariables {
  id: string;
  quantity?: number;
}

interface Props {
  className?: string;
  children: ReactNode;
  order: APIOrder;
  variables: UpdateOrderRowVariables;
  redirect: string;
  updateOrderRowMutation?: () => {};
}
export function orderReducerUpdateOrderRow(order: APIOrder, variables: UpdateOrderRowVariables) {
  const newOrder = {
    ...order,
    rows: order.rows.reduce((rows, row) => {
      if (row.id === variables.id) {
        if (variables.quantity < 1) {
          // row deleted!
          return rows;
        }
        row = {...row, ...variables};
      }
      return [...rows, row];
    }, []),
  };

  return calculateTotals(newOrder);
}

export const updateOrderRowQuery: any = gql`
  mutation updateOrderRow ($id: ID! $quantity: Int) {
    updateOrderRow (id: $id quantity: $quantity) {
      order {
        ...GetOrderFragment
      }
    }
  }
  ${GetOrderFragment}
`;

export const UpdateOrderRow = ({ children, redirect, variables, updateOrderRowMutation }: Props) => (
  <form
    action={'/_gql/m'}
    method="post"
    onSubmit={(e) => {
      e.preventDefault();

      updateOrderRowMutation();
    }}
    >
      <input type="hidden" name="query" value={printSource(updateOrderRowQuery)} />
      <input type="hidden" name="redirect" value={redirect} />
      <input type="hidden" name="variables" value={JSON.stringify(variables)} />
      {children}
  </form>
);

export const updateOrderRowGraphQL = graphql<Response, Props>(updateOrderRowQuery, {
  props: (props) => ({
    updateOrderRowMutation: () => {
      const {order, variables} = props.ownProps;
      return props.mutate({
        variables,
        optimisticResponse: ({
          __typename: 'Mutation',
          updateOrderRow: {
            __typename: 'OrderRow',
            order: orderReducerUpdateOrderRow(order, variables),
          },
        }),
      });
    },
  }),
});

export default updateOrderRowGraphQL(UpdateOrderRow);
