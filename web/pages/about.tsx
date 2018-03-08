import Head from 'next/head';
import Layout from '../components/Layout';
import withOrder from '../lib/withOrder';

export default withOrder(props => (
  <Layout {...props} title="About">
    About us
  </Layout>
));
