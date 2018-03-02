import Checkout from '../components/Checkout';
import Layout from '../components/Layout';
import withData from '../lib/withData';

export default withData(props => (
  <Layout {...props}>
    <Checkout />
  </Layout>
));
