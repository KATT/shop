
import Link from 'next/link';

export default () => (
  <header>
    <nav>
      <Link href="/" prefetch>
        <a>Home</a>
      </Link>{' '}
      <Link href="/about" prefetch>
        <a>About</a>
      </Link>{' '}
      <Link href="/checkout" prefetch>
        <a>Checkout</a>
      </Link>{' '}
    </nav>
  </header>
);
