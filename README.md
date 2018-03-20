# React/Prisma/TS/GraphQL E-Commerce Example

[![Build Status](https://travis-ci.org/KATT/shop.svg?branch=master)](https://travis-ci.org/KATT/shop) [![Maintainability](https://api.codeclimate.com/v1/badges/073d5e009a2b0cd2d0b9/maintainability)](https://codeclimate.com/github/KATT/shop/maintainability)

Attempt to create a great reference project with an amazing developer experience wherein a lot of common React/Prisma/GraphQL challenges are addressed.

* [shop.kattcorp.co.uk](https://shop.kattcorp.co.uk)
* [shop-api.kattcorp.co.uk](https://shop-api.kattcorp.co.uk)

## Tech

* [TypeScript](typescriptlang.org) (we have `*.js` in `.gitignore`!)
* Monorepo setup with a few different projects
  * `/api` - [GraphQL](http://graphql.org/) API Gateway in front of [Prisma](https://prismagraphql.com)
  * `/web` - [Next.js](https://github.com/zeit/next.js/) [React](https://reactjs.org/) App with [Apollo Client](https://www.apollographql.com/)
  * `/e2e` - [Nightwatch.js](http://nightwatchjs.org/) E2E testing
* [Travis CI](https://travis-ci.org) with [Sauce Labs](http://saucelabs.com/) for cross-browser testing

### `/web` features

* Server-side rendered React app.
* GraphQL using Apollo with optmistic updates.
* Pessimistic™ updates - app works completely **without JS enabled** in the browser (and there's E2E tests for it).
* Creates a shopping cart (`Order`) before page load, reference id saved to cookies
* Add/edit products to/in cart
* Product list from GraphQL
* Open checkout route in modal
* Discount code support (try code "`first`")

## Setup

1.  Install node 9
1.  Install [Homebrew](https://brew.sh/)
1.  Install Docker - `brew cask install docker`
1.  Install yarn - `npm install -g yarn`
1.  Start Docker
1.  `yarn install`
    * Installs deps for
      * `/`
      * `/api`
      * `/web`
      * `/e2e`
1.  Start Prisma + seed DB `yarn setup:prisma`

## Development

```sh
yarn dev
```

Starts the `/api` Gateway, the Next.js `/web`, and a TypeScript watcher for `/e2e` in parallell.

If you prefer separate output, navigate to `/api`, etc in separate shells and run `yarn dev`

If everything goes smoothly you should be able to access the below:

* API Gateway: http://localhost:4000
* Web App: http://localhost:5000

## Tests

### API Gateway

Uses [Jest](https://facebook.github.io/jest/).

```sh
yarn test:api
```

### Web

`/web` has no tests _(yet)_.

### E2E

#### Install dependencies

```sh
brew install selenium-server-standalone
brew install chromedriver
brew install geckodriver
brew cask install java
```

#### Run

1.  Run selenium: `yarn selenium`
1.  Setup + start apps: `yarn setup && yarn build && yarn dev`
1.  Run tests: `yarn start:e2e`
    * Will run E2E in Chrome with JS enabled
    * To run without js: `yarn start:e2e -- --env chrome:nojs`
    * See [nightwatch.ts](./e2e/src/nightwatch.ts) for all envs

### Conventions, how to write etc

#### `/web`

* `/mutations` and `/queries` exposes render prop components for easy handling of data loading / rendering
* .. _TBC_

## What's next / questions

This is a bit of a playground for web tech for me. I'm still developing it & I gather a list of things I'd like to do in [issues](https://github.com/KATT/shop/issues).

If you have problems running it, ideas of things to add, things you want me to explain / elaborate on, or need help to build a product - [open an issue](https://github.com/KATT/shop/issues/new) or reach out to me [on Twitter](https://twitter.com/alexheartjs).

Feel free to fork it and make a pull request of something cool!
