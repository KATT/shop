import gql from 'graphql-tag';

export const GetCartFragment = gql`
  fragment GetCartFragment on Cart {
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
    cart(where: {id: $id}) {
      ...GetCartFragment
    }
  }
  ${GetCartFragment}
`;
