declare namespace NodeJS {
  interface Process {
    browser: boolean;
  }
  interface Global {
    fetch: (url: string, options?: {}) => Promise<any>;
  }
}
// https://github.com/apollographql/react-apollo/issues/1286#issuecomment-350591666
// declare module 'lodash.flowright';

import 'react';

declare module 'react' {
  interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> {
    jsx?: boolean;
    global?: boolean;
  }
}
