'use strict';

const path = require('path');
const compileNodeModulesPlugin = require('./index');

const webpackOptions = {
    isServer: false,
};

const createWebpackConfig = () => ({
    module: {
        rules: [
            {
                test: /\.(tsx|ts|js|mjs|jsx)$/,
                include: ['/path/to/project'],
                exclude: () => {},
                use: {
                    loader: 'next-babel-loader',
                    options: {
                        isServer: true,
                        hasModern: false,
                        distDir: '/path/to/project/.next',
                        cwd: '/path/to/project',
                        cache: true,
                    },
                },
            },
        ],
    },
    externals: () => {},
});

it('should duplicate the default JS rule', () => {
    const config = compileNodeModulesPlugin()().webpack(createWebpackConfig(), webpackOptions);
    const rule = config.module.rules[1];

    expect(rule.test.toString()).toBe('/\\.js$/');
    expect(rule.include.toString()).toMatch(/\bnode_modules\b/);
    expect(rule.use.options.distDir).toBe(path.join('/path/to/project/.next', 'compile-node-modules'));
    expect(rule.use.options.caller).toEqual({ isNodeModule: true });

    // Test if the first rule is untouched
    expect(config.module.rules[0].include).toEqual(['/path/to/project']);
});

it('should throw if the JS rule was not found', () => {
    const noGoodRuleConfig = createWebpackConfig();

    noGoodRuleConfig.module.rules[0].use.loader = 'bad-loader';

    expect(() => compileNodeModulesPlugin()().webpack(noGoodRuleConfig, webpackOptions)).toThrow(/JS rule/);
});

it('should allow to override the rule\'s test, include and exclude properties', () => {
    const options = {
        test: 'my-test',
        include: 'my-include',
        exclude: 'my-exclude',
    };

    const config = compileNodeModulesPlugin(options)().webpack(createWebpackConfig(), webpackOptions);

    const rule = config.module.rules[1];

    expect(rule.test).toBe('my-test');
    expect(rule.include).toBe('my-include');
    expect(rule.exclude).toBe('my-exclude');
});

it('should call nextConfig webpack if defined', () => {
    const nextConfig = {
        webpack: jest.fn(() => 'foo'),
    };

    const config = compileNodeModulesPlugin()(nextConfig).webpack(createWebpackConfig(), webpackOptions);

    expect(nextConfig.webpack).toHaveBeenCalledTimes(1);
    expect(config).toBe('foo');
});

it('should only have react packages in externals', () => {
    const config = compileNodeModulesPlugin()().webpack(createWebpackConfig(), {
        ...webpackOptions,
        isServer: true,
    });

    expect(config.externals.test('react')).toBeTruthy();
    expect(config.externals.test('react-dom')).toBeTruthy();
    expect(config.externals.test('scheduler')).toBeTruthy();
    expect(config.externals.test('use-subscription')).toBeTruthy();
});
