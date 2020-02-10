'use strict';

const path = require('path');

const toArray = (val) => Array.isArray(val) ? val : [val].filter(Boolean);

const copyJsRule = (config, options, ruleOptions) => {
    const { dir, config: { distDir } } = options;

    const jsRuleIndex = config.module.rules.findIndex((rule) => rule.use && /\bnext-babel-loader\b/.test(rule.use.loader));
    const jsRule = config.module.rules[jsRuleIndex];

    if (!jsRule) {
        throw new Error('Could not find JS rule with next-babel-loader');
    }

    const jsRuleNodeModules = {
        ...jsRule,
        test: /\.js$/, // Only assume JS files since node_modules are at least already transpiled to official JS
        include: /[\\/]node_modules[\\/]/,
        ...ruleOptions,
        exclude: [
            ...toArray(ruleOptions.exclude),
            // Next.js >= v9.1.5 is now inlining statements through `babel-plugin-transform-define`, see https://github.com/zeit/next.js/blob/d64587e1a3af11411a6c458ae9544950dfba7825/packages/next/build/webpack/loaders/next-babel-loader.js#L185
            // However, the `process.browser` inlining was causing problems with Webpack builtin
            // `node-libs-browser` (mock) and `node-process`
            /[\\/]node_modules[/\\](node-libs-browser|process)[/\\]/,
        ],
        use: {
            ...jsRule.use,
            options: {
                ...jsRule.use.options,
                // Force a different cacheDirectory because there's no way to add `isNodeModule` to the cacheIdentifier
                distDir: path.join(dir, distDir, 'cache', 'compile-node-modules-plugin'),
                // Add `isNodeModule` to the caller so that it's accessible in babel.config.js
                caller: {
                    ...jsRule.use.options.caller,
                    isNodeModule: true,
                },
            },
        },
    };

    config.module.rules.splice(jsRuleIndex + 1, 0, jsRuleNodeModules);
};

const withCompileNodeModules = (options = {}) => {
    const { serverExternals = [], ...ruleOptions } = options;

    return (nextConfig = {}) => ({
        ...nextConfig,
        webpack: (config, options) => {
            const { isServer, target, config: { experimental } } = options;
            const isServerless = target === 'serverless';

            copyJsRule(config, options, ruleOptions);

            if (isServer && !isServerless) {
                config.externals = [
                    ...Array.isArray(serverExternals) ? serverExternals : [serverExternals],
                    // Prevent multiple router provider/context and config modules from being present in the same process,
                    // leading to subtle errors
                    ...Object.keys(config.resolve.alias),
                    // This is needed since Next.js requires the React to be the same instance in every page
                    // Otherwise, React would be injected individually in every page and using React Hooks would throw:
                    // Invalid Hook Call Warning (https://reactjs.org/warnings/invalid-hook-call-warning.html)
                    // Regex copied from https://github.com/zeit/next.js/blob/154d78461ce2598d6e12343b452b45071a323d11/packages/next/build/webpack-config.ts#L295
                    /^(react|react-dom|scheduler|use-subscription)$/i,
                    // The two entries below are copied from https://github.com/zeit/next.js/blob/04a7f1e85d34c72a3d45a05f4ca9d158ef1b5af0/packages/next/build/webpack-config.ts#L627
                    '@ampproject/toolbox-optimizer',
                    /* istanbul ignore next */
                    (context, request, callback) => {
                        if (
                            request === 'react-ssr-prepass' &&
                            !experimental.ampBindInitData &&
                            context.replace(/\\/g, '/').includes('next-server/server')
                        ) {
                            return callback(undefined, `commonjs ${request}`);
                        }

                        return callback();
                    },
                ];
            }

            if (typeof nextConfig.webpack === 'function') {
                return nextConfig.webpack(config, options);
            }

            return config;
        },
    });
};

module.exports = withCompileNodeModules;
