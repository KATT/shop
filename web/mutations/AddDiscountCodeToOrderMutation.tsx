import gql from 'graphql-tag';
import {print as printSource} from 'graphql/language/printer';
import React, { ReactNode } from 'react';
import { graphql } from 'react-apollo';
import { AddDiscountCodeToOrderVariables, APIOrder } from '../lib/prisma';
import { GetOrderFields } from '../queries/GetOrderQuery';

type addDiscountCodeToOrderMutationFn = (variables: AddDiscountCodeToOrderVariables) => Promise<any>;

interface RenderCallbackProps {
  addDiscountCodeToOrderMutation: addDiscountCodeToOrderMutationFn;
}

type RenderCallback = (props: RenderCallbackProps) => JSX.Element;

export interface Props {
  className?: string;
  children: ReactNode | RenderCallback;
  redirect: string;
  addDiscountCodeToOrderMutation?: addDiscountCodeToOrderMutationFn;
  style?;
  submit(fn: addDiscountCodeToOrderMutationFn);
}

export const AddDiscountToOrderAST: any = gql`
  mutation addDiscountCodeToOrder ($orderId: ID! $code: String!) {
    addDiscountCodeToOrder (orderId: $orderId code: $code) {
      ${GetOrderFields}
    }
  }
`;

const AddDiscountToOrderASTString = printSource(AddDiscountToOrderAST);

function isFunction(obj: any) {
  return typeof obj === 'function';
}

export const AddDiscountCodeToOrder = ({
  children,
  redirect,
  addDiscountCodeToOrderMutation,
  submit,
 }: Props) => (
  <form
    action={'/_gql/m'}
    method="post"
    onSubmit={(e) => {
      e.preventDefault();
      submit(addDiscountCodeToOrderMutation);
    }}
    >
      <input type="hidden" name="query" value={AddDiscountToOrderASTString} />
      <input type="hidden" name="redirect" value={redirect} />
      {isFunction(children) ? (children as RenderCallback)({addDiscountCodeToOrderMutation}) : children}
  </form>
);

export const AddDiscountCodeToOrderMutation = graphql<Response, Props>(AddDiscountToOrderAST, {
  props: (props) => ({
    addDiscountCodeToOrderMutation: (variables: AddDiscountCodeToOrderVariables) => {
      return props.mutate({
        variables,
      });
    },
  }),
})(AddDiscountCodeToOrder);

export default AddDiscountCodeToOrderMutation;
