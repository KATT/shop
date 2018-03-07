import gql from 'graphql-tag';

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

export const GetOrderQuery = gql`
  query GetOrderQuery($id: ID!) {
    order(id: $id) {
      ...GetOrderFragment
    }
  }
  ${GetOrderFragment}
`;
