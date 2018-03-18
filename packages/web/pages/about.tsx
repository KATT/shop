import Head from 'next/head';
import Layout from '../components/Layout';
import withOrder from '../lib/withOrder';

export default withOrder(props => (
  <Layout {...props} title="About">
    <h1>About</h1>
    <a href="https://github.com/KATT/shop">https://github.com/KATT/shop</a>
  </Layout>
));
