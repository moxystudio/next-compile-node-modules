'use strict';

const compileNodeModulesPlugin = require('./index');

const webpackOptions = {
    dir: 'my-project',
    isServer: false,
    config: {
        distDir: '.next',
    },
};

const createWebpackConfig = () => ({
    resolve: {
        alias: {
            foo: 'bar',
        },
    },
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
    expect(rule.use.options.distDir).toBe('my-project/.next/cache/compile-node-modules-plugin');
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

it('should have pre-configured server externals', () => {
    const config = compileNodeModulesPlugin()().webpack(createWebpackConfig(), {
        ...webpackOptions,
        isServer: true,
    });

    const alias = config.externals && config.externals[0];
    const nativeBinary = config.externals && config.externals[1];
    const react = config.externals && config.externals[2];

    expect(alias).toBe('foo');

    expect(nativeBinary).toBeDefined();
    expect(nativeBinary.test('foo.node')).toBeTruthy();

    expect(react).toBeDefined();
    expect(react.test('react')).toBeTruthy();
    expect(react.test('react-dom')).toBeTruthy();
    expect(react.test('scheduler')).toBeTruthy();
    expect(react.test('use-subscription')).toBeTruthy();
});

it('should unshift custom server externals (single)', () => {
    const options = {
        serverExternals: 'foo',
    };

    const config = compileNodeModulesPlugin(options)().webpack(createWebpackConfig(), {
        ...webpackOptions,
        isServer: true,
    });

    expect(config.externals).toHaveLength(4);
    expect(config.externals[0]).toBe('foo');
});

it('should unshift custom server externals (array)', () => {
    const options = {
        serverExternals: ['foo', 'bar'],
    };

    const config = compileNodeModulesPlugin(options)().webpack(createWebpackConfig(), {
        ...webpackOptions,
        isServer: true,
    });

    expect(config.externals).toHaveLength(5);
    expect(config.externals[0]).toBe('foo');
    expect(config.externals[1]).toBe('bar');
});

it('should leave externals untouched when serverless', () => {
    const options = {
        serverExternals: ['foo', 'bar'],
    };

    const config = compileNodeModulesPlugin(options)().webpack(createWebpackConfig(), {
        ...webpackOptions,
        isServer: true,
        target: 'serverless',
    });

    expect(typeof config.externals).toBe('function');
});
