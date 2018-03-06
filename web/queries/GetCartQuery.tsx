import gql from 'graphql-tag';

export const GetCartFragment = gql`
  fragment GetCartFragment on Cart {
    __typename
    id
    products {
      quantity
      product {
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
