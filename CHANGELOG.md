# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [2.1.1](https://github.com/moxystudio/next-compile-node-modules/compare/v2.1.0...v2.1.1) (2021-06-24)


### Bug Fixes

* remove react refresh from webpack rule ([053d0f7](https://github.com/moxystudio/next-compile-node-modules/commit/053d0f7166efae8d8398e350d3ec0c3dae6fba72))

## [2.1.0](https://github.com/moxystudio/next-compile-node-modules/compare/v2.0.2...v2.1.0) (2021-06-24)


### Features

* add Next.js 11 compat ([#14](https://github.com/moxystudio/next-compile-node-modules/issues/14)) ([20219f3](https://github.com/moxystudio/next-compile-node-modules/commit/20219f3d20741daa1718109aac5a86cfb4abbfa8))

### [2.0.2](https://github.com/moxystudio/next-compile-node-modules/compare/v2.0.1...v2.0.2) (2021-01-19)


### Bug Fixes

* next 10 compat when serverless ([be2a4ea](https://github.com/moxystudio/next-compile-node-modules/commit/be2a4ea22239c2239a422a5a2d6d26ecdcbac171))

### [2.0.1](https://github.com/moxystudio/next-compile-node-modules/compare/v2.0.0...v2.0.1) (2021-01-18)


### Bug Fixes

* avoid using optional chaining because of node 12 compat ([4840003](https://github.com/moxystudio/next-compile-node-modules/commit/484000354ba4b320bcfbea0a740574d365cd7183))

## [2.0.0](https://github.com/moxystudio/next-compile-node-modules/compare/v1.3.6...v2.0.0) (2021-01-17)


### ⚠ BREAKING CHANGES

* might not work with next < 10

### Bug Fixes

* add compatibility with next 10 ([19b7a05](https://github.com/moxystudio/next-compile-node-modules/commit/19b7a054e2fb0c4428802c73a5026326c2315bd4))

### [1.3.6](https://github.com/moxystudio/next-compile-node-modules/compare/v1.3.5...v1.3.6) (2020-06-25)


### Bug Fixes

* deal with use rule being an array ([#10](https://github.com/moxystudio/next-compile-node-modules/issues/10)) ([f253108](https://github.com/moxystudio/next-compile-node-modules/commit/f253108fe1b53f74bace97b726e64abf9fb8b503))

### [1.3.5](https://github.com/moxystudio/next-compile-node-modules/compare/v1.3.3...v1.3.5) (2020-03-23)


### Bug Fixes

* fix serverless & serverless-trace builds ([7edb252](https://github.com/moxystudio/next-compile-node-modules/commit/7edb252c245989d5b94860c6c0abf7d6540f481b))
* fix undefined in webpack config ([f695610](https://github.com/moxystudio/next-compile-node-modules/commit/f69561098dff14ee94ce9455691f275c6b429c81)), closes [#9](https://github.com/moxystudio/next-compile-node-modules/issues/9)

### [1.3.4](https://github.com/moxystudio/next-compile-node-modules/compare/v1.3.3...v1.3.4) (2020-02-10)


### Bug Fixes

* fix undefined in webpack config ([f695610](https://github.com/moxystudio/next-compile-node-modules/commit/f69561098dff14ee94ce9455691f275c6b429c81)), closes [#9](https://github.com/moxystudio/next-compile-node-modules/issues/9)

### [1.3.3](https://github.com/moxystudio/next-compile-node-modules/compare/v1.3.2...v1.3.3) (2019-12-22)


### Bug Fixes

* compatibility with Next >= v9.1.5 ([#8](https://github.com/moxystudio/next-compile-node-modules/issues/8)) ([73166f7](https://github.com/moxystudio/next-compile-node-modules/commit/73166f799f0570dc905116efa25b6a36614669c1)), closes [/github.com/zeit/next.js/blob/d64587e1a3af11411a6c458ae9544950dfba7825/packages/next/build/webpack/loaders/next-babel-loader.js#L185](https://github.com/moxystudio//github.com/zeit/next.js/blob/d64587e1a3af11411a6c458ae9544950dfba7825/packages/next/build/webpack/loaders/next-babel-loader.js/issues/L185)

### [1.3.2](https://github.com/moxystudio/next-compile-node-modules/compare/v1.3.1...v1.3.2) (2019-11-30)


### Bug Fixes

* make it compatible with next deployments ([db15f5f](https://github.com/moxystudio/next-compile-node-modules/commit/db15f5fb7cfe4a3927b3f5ca8fc5b27fb5a51046))

### [1.3.1](https://github.com/moxystudio/next-compile-node-modules/compare/v1.3.0...v1.3.1) (2019-11-26)


### Bug Fixes

* do not externalize next alias, such as config and router ([#7](https://github.com/moxystudio/next-compile-node-modules/issues/7)) ([d33cb21](https://github.com/moxystudio/next-compile-node-modules/commit/d33cb21afa058c2b792bb74d446131631e7ec73f))

## [1.3.0](https://github.com/moxystudio/next-compile-node-modules/compare/v1.2.0...v1.3.0) (2019-11-19)


### Features

* externalize native extensions ([#6](https://github.com/moxystudio/next-compile-node-modules/issues/6)) ([ac1b060](https://github.com/moxystudio/next-compile-node-modules/commit/ac1b0600997dfe5ba2be62fafe3e6bc190a9c4db))

## [1.2.0](https://github.com/moxystudio/next-compile-node-modules/compare/v1.1.1...v1.2.0) (2019-11-19)


### Features

* add ability to declare additional server externals ([#5](https://github.com/moxystudio/next-compile-node-modules/issues/5)) ([16f548d](https://github.com/moxystudio/next-compile-node-modules/commit/16f548deab7352763f1c0b2db03d482734970c58))

### [1.1.1](https://github.com/moxystudio/next-compile-node-modules/compare/v1.1.0...v1.1.1) (2019-11-13)


### Bug Fixes

* next externals ([#4](https://github.com/moxystudio/next-compile-node-modules/issues/4)) ([dc0d4bc](https://github.com/moxystudio/next-compile-node-modules/commit/dc0d4bc9ef1f217a5e7f4280bd0d6ce36483bf61))

## [1.1.0](https://github.com/moxystudio/next-compile-node-modules/compare/v1.0.0...v1.1.0) (2019-11-06)


### Features

* include dependencies in bundle ([#3](https://github.com/moxystudio/next-compile-node-modules/issues/3)) ([7af8ff2](https://github.com/moxystudio/next-compile-node-modules/commit/7af8ff26d6c2080c58a6477ce0baa73ba95750e0))

## [1.0.0](https://github.com/moxystudio/next-compile-node-modules/compare/v0.0.1...v1.0.0) (2019-10-11)

### 0.0.1 (2019-10-11)


### Features

* initial implementation ([#1](https://github.com/moxystudio/next-compile-node-modules/issues/1)) ([8a1a950](https://github.com/moxystudio/next-compile-node-modules/commit/8a1a9508ad9749c986fc6322cfccd87387f71945))
