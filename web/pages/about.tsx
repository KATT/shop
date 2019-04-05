import Layout from '../components/Layout';
import Logo from '../components/Logo';
import withOrder from '../lib/withOrder';

export default withOrder(props => (
  <Layout {...props} title="About">
    <h1>About</h1>
    <p>
      Source: <a href="https://github.com/KATT/shop">https://github.com/KATT/shop</a></p>
    <hr/>
    <Logo />
    <p>Project by <a href="https://kattcorp.com">kattcorp.com</a></p>
  </Layout>
));
