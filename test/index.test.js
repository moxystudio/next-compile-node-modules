'use strict';

// const compileNodeModulesPlugin = require('.');

// const webpackConfig = {
//     module: {
//         rules: [
//             {
//                 test: /\.(tsx|ts|js|mjs|jsx)$/,
//                 include: [
//                     '/path/to/project',
//                     /next[\\/]dist[\\/]next-server[\\/]lib/,
//                     /next[\\/]dist[\\/]client/,
//                     /next[\\/]dist[\\/]pages/,
//                     /[\\/](strip-ansi|ansi-regex)[\\/]/,
//                 ],
//                 exclude: () => {},
//                 use: {
//                     loader: 'next-babel-loader',
//                     options: {
//                         isServer: true,
//                         hasModern: false,
//                         distDir: '/path/to/project/.next',
//                         cwd: '/path/to/project',
//                         cache: true,
//                     },
//                 },
//             },
//         ],
//     },
// };

it('should duplicate the default JS rule', () => {

});

it('should throw if the JS rule was not found', () => {

});

it('should allow to override the rule\'s test, include and exclude properties', () => {

});

it('should call nextConfig webpack if defined', () => {

});
