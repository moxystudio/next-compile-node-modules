# next-compile-node-modules

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][codecov-image]][codecov-url] [![Dependency status][david-dm-image]][david-dm-url] [![Dev Dependency status][david-dm-dev-image]][david-dm-dev-url]

[npm-url]:https://npmjs.org/package/@moxy/next-compile-node-modules
[downloads-image]:https://img.shields.io/npm/dm/@moxy/next-compile-node-modules.svg
[npm-image]:https://img.shields.io/npm/v/@moxy/next-compile-node-modules.svg
[travis-url]:https://travis-ci.org/moxystudio/next-compile-node-modules
[travis-image]:https://img.shields.io/travis/moxystudio/next-compile-node-modules/master.svg
[codecov-url]:https://codecov.io/gh/moxystudio/next-compile-node-modules
[codecov-image]:https://img.shields.io/codecov/c/github/moxystudio/next-compile-node-modules/master.svg
[david-dm-url]:https://david-dm.org/moxystudio/next-compile-node-modules
[david-dm-image]:https://img.shields.io/david/moxystudio/next-compile-node-modules.svg
[david-dm-dev-url]:https://david-dm.org/moxystudio/next-compile-node-modules?type=dev
[david-dm-dev-image]:https://img.shields.io/david/dev/moxystudio/next-compile-node-modules.svg

Next.js plugin to compile all `node_modules` using Babel.

## Motivation

Package authors should publish any JavaScript code to npm as long as it's only pure valid JavaScript (any version). It doesn't make sense to compile at the package level because authors don't know in which context their packages will be used. For instance, a package that has been published with code compiled to ES5 may be used in app that only targets evergreen browsers, making the bundle unnecessarily larger (or vice-versa).

Instead, app developers should compile `node_modules` using [`babel-preset-env`](https://babeljs.io/docs/en/babel-preset-env) and instruct it to produce compatible for the browsers they want to support (e.g. "IE 11"). Popular boilerplate projects such as [`create-react-app`](https://github.com/facebook/create-react-app) now compile all `node_modules` and you should too!

This plugin changes Next.js's webpack config to compile all `node_modules` by default. While this has an impact on performance, it only slows down the first compilation and subsequent ones will be much faster thanks to the built-in cache.

## Installation

```sh
$ npm i --save @moxy/next-compile-node-modules
```

## Usage

```js
// next.config.js
const withCompileNodeModules = require('@moxy/next-compile-node-modules');

module.exports = withCompileNodeModules({ ...options })({ ...nextConfig });
```

Multiple configurations can be combined together with function composition. For example:

```js
// next.config.js
const withCSS = require('@zeit/next-css');
const withCompileNodeModules = require('@moxy/next-compile-node-modules');

module.exports = withCSS(
    withCompileNodeModules({
        exclude: [require.resolve('some-module')],
    })({
        cssModules: true, // this options will be passed to withCSS plugin through nextConfig
    }),
);
```

### Available options

| Option | Description | Type | Default |
|  ---   |     ---     | ---  |   ---   |
| test | The Webpack rule test condition | [Rule.test](https://webpack.js.org/configuration/module/#ruletest) | `/\.js$/` |
| include | The Webpack rule include condition | [Rule.include](https://webpack.js.org/configuration/module/#ruleinclude) | `/[\\/]node_modules[\\/]/` |
| exclude | Prepend exclusions to the Webpack rule exclude condition besides the built-in**¹** ones | [Rule.exclude](https://webpack.js.org/configuration/module/#ruleexclude) | |
| serverExternals | Prepend additional externals dependencies besides the built-in**²** ones. This option is ignored in the client build or when target is serverless | Any [supported types](https://webpack.js.org/configuration/externals/)

**¹** Built-in exclusions are Next.js and Webpack related, such as [`node-libs-browser`](https://www.npmjs.com/package/node-libs-browser) and [`process`](https://www.npmjs.com/package/node-process).

**²** Built-in externals are Next.js related as well as modules associated with React. More specifically, it prevents React from being bundled individually in each page which would cause issues such as "React Hooks would throw: Invalid Hook Call Warning".

### Custom babel config

If you are using a custom `babel.config.js`, you may identify if we are compiling a node module or not via `api.caller` like so:

```js
// babel.config.js

module.exports = (api) => {
    const isNodeModule = api.caller((caller) => caller.isNodeModule);

    // You may now use `isNodeModule` to conditionally make changes to the returned config

    return {
        // ...
    };
};
```

## Tests

Any parameter passed to the `test` command, is passed down to Jest.

```sh
$ npm t
$ npm t -- --watch # during development
```

## License

Released under the [MIT License](https://www.opensource.org/licenses/mit-license.php).
