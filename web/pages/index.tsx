import Layout from '../components/Layout';
import ProductList from '../components/ProductList';
import withCart from '../lib/withCart';

export default withCart(props => (
  <Layout {...props}>
    Hello World.{' '}

    <ProductList />
  </Layout>
));
