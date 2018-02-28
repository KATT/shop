import Layout from '../components/Layout';
import ProductList from '../components/ProductList';
import withData from '../lib/withData';

export default withData(() => (
  <Layout>
    Hello World.{' '}
    <ProductList />
  </Layout>
));
