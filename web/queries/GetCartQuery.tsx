import gql from 'graphql-tag';

export const GetCartFragment = gql`
  fragment GetCartFragment on Cart {
    __typename
    id
    products {
      __typename
      id
      quantity
      product {
        __typename
        id
        name
        brand { name }
      }
    }
  }
`;

export const GetCartQuery = gql`
  query GetCartQuery($id: ID!) {
    cart(id: $id) {
      ...GetCartFragment
    }
  }
  ${GetCartFragment}
`;
