'use strict';

const path = require('path');

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
        exclude: undefined,
        ...ruleOptions,
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
            const { isServer, target } = options;
            const isServerless = target === 'serverless';

            copyJsRule(config, options, ruleOptions);

            if (isServer && !isServerless) {
                config.externals = [
                    ...Array.isArray(serverExternals) ? serverExternals : [serverExternals],
                    // Ignore native extensions binary files, since they can't be bundled by webpack
                    /\.node$/,
                    // This is needed since Next.js requires the React to be the same instance in every page.
                    // Otherwise, React would be injected individually in every page and using
                    // React Hooks would throw: Invalid Hook Call Warning (https://reactjs.org/warnings/invalid-hook-call-warning.html)
                    // Regex copied from https://github.com/zeit/next.js/blob/154d78461ce2598d6e12343b452b45071a323d11/packages/next/build/webpack-config.ts#L295
                    /^(react|react-dom|scheduler|use-subscription)$/i,
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
