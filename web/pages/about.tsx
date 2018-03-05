import Layout from '../components/Layout';
import withCart from '../lib/withCart';

export default withCart(props => (
  <Layout {...props}>About us</Layout>
));
