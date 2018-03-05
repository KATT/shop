import Checkout from '../components/Checkout';
import Layout from '../components/Layout';
import withCart from '../lib/withCart';

export default withCart(props => (
  <Layout {...props}>
    <Checkout />
  </Layout>
));
