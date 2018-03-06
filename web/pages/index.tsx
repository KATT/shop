import Layout from '../components/Layout';
import ProductList from '../components/ProductList';
import withCart, { WithCartProps } from '../lib/withCart';

export default withCart((props: WithCartProps) => (
  <Layout {...props}>
    Hello World.{' '}

    <ProductList cartId={props.cartId} />
  </Layout>
));
