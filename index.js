'use strict';

const path = require('path');

const copyJsRule = (jsRule, options) => ({
    ...jsRule,
    test: /\.js$/, // Only assume JS files since node_modules are at least already transpiled to official JS
    include: /[\\/]node_modules[\\/]/,
    exclude: undefined,
    ...options,
    use: {
        ...jsRule.use,
        options: {
            ...jsRule.use.options,
            // Force a different cacheDirectory because there's no way to add `isNodeModule` to the cacheIdentifier
            distDir: path.join(jsRule.use.options.distDir, 'compile-node-modules'),
            // Add `isNodeModule` to the caller so that it's accessible in babel.config.js
            caller: {
                ...jsRule.use.options.caller,
                isNodeModule: true,
            },
        },
    },
});

const withCompileNodeModules = (userOptions = {}) => (nextConfig = {}) => ({
    ...nextConfig,
    webpack: (config, options) => {
        const jsRuleIndex = config.module.rules.findIndex((rule) =>
            rule.use && /\bnext-babel-loader\b/.test(rule.use.loader));
        const jsRule = config.module.rules[jsRuleIndex];

        if (!jsRule) {
            throw new Error('Could not find JS rule with next-babel-loader');
        }

        const jsRuleNodeModules = copyJsRule(jsRule, userOptions);

        config.module.rules.splice(jsRuleIndex + 1, 0, jsRuleNodeModules);
        delete config.externals;

        if (typeof nextConfig.webpack === 'function') {
            return nextConfig.webpack(config, options);
        }

        return config;
    },
});

module.exports = withCompileNodeModules;
