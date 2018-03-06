import Layout from '../components/Layout';
import withOrder from '../lib/withOrder';

export default withOrder(props => (
  <Layout {...props}>About us</Layout>
));
