import Layout from '../components/Layout';
import ProductList from '../components/ProductList';
import withOrder, { WithOrderProps } from '../lib/withOrder';

export default withOrder((props: WithOrderProps) => (
  <Layout {...props}>
    Hello World.{' '}

    <ProductList orderId={props.orderId} />
  </Layout>
));
