import gql from 'graphql-tag';
import { APIOrder } from 'lib/prisma';
import { ReactElement, ReactNode } from 'react';
import { compose, graphql, QueryProps } from 'react-apollo';

export const GetOrderProductFields = `
  __typename
  id
  name
  price
  brand { name }
  thumbnail
`;

export const GetOrderFields = `
  __typename
  id
  subTotal
  total
  discountsTotal
  discountCodes {
    __typename
    id
    name
    amount
    type
    code
    description
  }

  rows {
    __typename
    id
    quantity
    total
    product {
      ${GetOrderProductFields}
    }
  }
`;

export const GetOrderQueryAST = gql`
  query GetOrderQuery($id: ID!) {
    order(id: $id) {
      ${GetOrderFields}
    }
  }
`;

interface InputProps {
  orderId: string;
  children(props: OrderData): ReactElement<any>;
}

export interface OrderData extends QueryProps {
  order?: Partial<APIOrder>;
}

interface IntermediateProps extends InputProps {
  data?: OrderData;
}

export const GetOrderComponent = ({ children, data }: IntermediateProps) => (
  children({...data})
);

export default graphql<Response, InputProps>(GetOrderQueryAST, {
  options: ({ orderId }) => ({
    variables: {
      id: orderId,
    },
  }),
})(GetOrderComponent);
