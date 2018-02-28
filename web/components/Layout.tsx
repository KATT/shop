import Link from 'next/link';
import {Fragment, ReactNode} from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default ({ children }: LayoutProps) => {
  return (
    <Fragment>
      <nav>
        <Link href="/" prefetch>
          <a>Home</a>
        </Link>{' '}
        <Link href="/about" prefetch>
          <a>About</a>
        </Link>
      </nav>
      <main>
        {children}
      </main>
   </Fragment>
  );
};
