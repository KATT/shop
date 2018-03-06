import Checkout from '../components/Checkout';
import Layout from '../components/Layout';
import withOrder from '../lib/withOrder';

export default withOrder(props => (
  <Layout {...props}>
    <Checkout orderId={props.orderId} />
  </Layout>
));
