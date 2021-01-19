'use strict';

const path = require('path');

const toArray = (val) => Array.isArray(val) ? val : [val].filter(Boolean);

const copyJsRule = (config, options, ruleOptions) => {
    const { dir, config: { distDir } } = options;
    let jsRuleUse;

    const jsRuleIndex = config.module.rules.findIndex((rule) => {
        const ruleUse = toArray(rule.use);

        return ruleUse.find((use) => {
            jsRuleUse = use;

            return /\bnext-babel-loader\b/.test(use.loader);
        });
    });

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
            // Ignore JS include patterns to avoid having certain node_modules being compiled twice
            ...jsRule.include,
            // Next.js >= v9.1.5 is now inlining statements through `babel-plugin-transform-define`, see https://github.com/zeit/next.js/blob/d64587e1a3af11411a6c458ae9544950dfba7825/packages/next/build/webpack/loaders/next-babel-loader.js#L185
            // However, the `process.browser` inlining was causing problems with Webpack builtin
            // `node-libs-browser` (mock) and `node-process`
            /[\\/]node_modules[/\\](node-libs-browser|process)[/\\]/,
        ],
        use: {
            ...jsRuleUse,
            options: {
                ...jsRuleUse.options,
                // Force a different cacheDirectory because there's no way to add `isNodeModule` to the cacheIdentifier
                distDir: path.join(dir, distDir, 'cache', 'compile-node-modules-plugin'),
                // Add `isNodeModule` to the caller so that it's accessible in babel.config.js
                caller: {
                    ...jsRuleUse.options.caller,
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
            const { isServer, config: { target, experimental } } = options;
            const isTargetServer = target === 'server';
            const isTargetServerlessTrace = target.includes('serverless-trace');

            copyJsRule(config, options, ruleOptions);

            if (isServer) {
                if (isTargetServer) {
                    const nextExternal = config.externals[0];

                    config.externals = [
                        ...Array.isArray(serverExternals) ? serverExternals : [serverExternals],
                        // This is needed since Next.js requires the React to be the same instance in every page
                        // Otherwise, React would be injected individually in every page and using React Hooks would throw:
                        // Invalid Hook Call Warning (https://reactjs.org/warnings/invalid-hook-call-warning.html)
                        // Regex copied from https://github.com/zeit/next.js/blob/154d78461ce2598d6e12343b452b45071a323d11/packages/next/build/webpack-config.ts#L295
                        /^(react|react-dom|scheduler|prop-types|use-subscription)$/i,
                        // Copied from https://github.com/zeit/next.js/blob/7fce52b90539203a8f9e9f5f1423397660d5a8f5/packages/next/build/webpack-config.ts#L565
                        '@ampproject/toolbox-optimizer',
                        (...args) => {
                            const argsWithoutCallback = args.slice(0, -1);
                            const callback = args[args.length - 1];

                            nextExternal(
                                ...argsWithoutCallback,
                                (err, external) => {
                                    const module = external && external.match(/[a-z0-9]+ (.+)/i);

                                    if (module && module[1].startsWith('next/')) {
                                        callback(err, external);
                                    } else {
                                        callback(err);
                                    }
                                },
                            );
                        },
                    ];
                } else if (isTargetServerlessTrace) {
                    config.externals = [
                        ...Array.isArray(serverExternals) ? serverExternals : [serverExternals],
                        // Copied from https://github.com/vercel/next.js/blob/b02df3f487ba6fbd9ba9bcd823c77a7b5391fc73/packages/next/build/webpack-config.ts#L761
                        '@ampproject/toolbox-optimizer',
                        ...(experimental && experimental.optimizeCss ? [] : ['critters']),
                    ];
                }
            }

            if (typeof nextConfig.webpack === 'function') {
                return nextConfig.webpack(config, options);
            }

            return config;
        },
    });
};

module.exports = withCompileNodeModules;
