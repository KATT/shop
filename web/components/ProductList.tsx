import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

const PRODUCTS_PER_PAGE = 50;

function ProductList({ data: { loading, error, products }, loadMoreProducts }: any) {
  if (error) { return <div>Error loading Products</div>; }
  if (products && products.length) {
    const areMoreProducts = true;
    return (
      <section>
        <ul>
          {products.map((product: any, index: number) =>
            <li key={product.id}>
              <div>
                <span>{index + 1}. </span>
                {product.name}
              </div>
            </li>,
          )}
        </ul>
        {areMoreProducts ?
          <button onClick={() => loadMoreProducts()}> {
            loading ? 'Loading...' : 'Show More'
          } </button> : ''}
        <style jsx>{`
          section {
            padding-bottom: 20px;
          }
          li {
            display: block;
            margin-bottom: 10px;
          }
          div {
            align-items: center;
            display: flex;
          }
          a {
            font-size: 14px;
            margin-right: 10px;
            text-decoration: none;
            padding-bottom: 0;
            border: 0;
          }
          span {
            font-size: 14px;
            margin-right: 5px;
          }
          ul {
            margin: 0;
            padding: 0;
          }
          button:before {
            align-self: center;
            border-style: solid;
            border-width: 6px 4px 0 4px;
            border-color: #ffffff transparent transparent transparent;
            content: "";
            height: 0;
            margin-right: 5px;
            width: 0;
          }
        `}</style>
      </section>
    );
  }
  return <div>Loading</div>;
}

const productsQuery: any = gql`
  query products($first: Int!, $skip: Int!) {
    products(orderBy: createdAt_DESC, first: $first, skip: $skip) {
      id
      name
    },
  }
`;

// The `graphql` wrapper executes a GraphQL query and makes the results
// available on the `data` prop of the wrapped component (ProductList)
export default graphql(productsQuery, {
  options: {
    variables: {
      skip: 0,
      first: PRODUCTS_PER_PAGE,
    },
  },
  props: ({ data }: any) => ({
    data,
    loadMoreProducts: () => {
      return data.fetchMore({
        variables: {
          skip: data.products.length,
        },
        updateQuery: (previousResult: any, { fetchMoreResult }: any) => {
          if (!fetchMoreResult) {
            return previousResult;
          }
          return Object.assign({}, previousResult, {
            // Append the new Products results to the old one
            products: [...previousResult.products, ...fetchMoreResult.products],
          });
        },
      });
    },
  }),
})(ProductList);
