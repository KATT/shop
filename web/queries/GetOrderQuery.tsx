import gql from 'graphql-tag';
import { APIOrder } from 'lib/prisma';
import { ReactElement, ReactNode } from 'react';
import { compose, graphql } from 'react-apollo';

export const GetOrderProductFragment = gql`
  fragment GetOrderProductFragment on Product {
    __typename
    id
    name
    price
    brand { name }
  }
`;

export const GetOrderFragment = gql`
  fragment GetOrderFragment on Order {
    __typename
    id
    total
    rows {
      __typename
      id
      quantity
      total
      product {
        ...GetOrderProductFragment
      }
    }
  }
  ${GetOrderProductFragment}
`;

export const GetOrderQueryAST = gql`
  query GetOrderQuery($id: ID!) {
    order(id: $id) {
      ...GetOrderFragment
    }
  }
  ${GetOrderFragment}
`;

interface InputProps {
  orderId: string;
  children(props: OrderData): ReactElement<any>;
}

export interface OrderData {
  loading: boolean;
  error?: any;
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
