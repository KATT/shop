import gql from 'graphql-tag';

export const GetOrderFragment = gql`
  fragment GetOrderFragment on Order {
    __typename
    id
    rows {
      __typename
      id
      quantity
      product {
        __typename
        id
        name
        price
        brand { name }
      }
    }
  }
`;

export const GetOrderQuery = gql`
  query GetOrderQuery($id: ID!) {
    order(id: $id) {
      ...GetOrderFragment
    }
  }
  ${GetOrderFragment}
`;
