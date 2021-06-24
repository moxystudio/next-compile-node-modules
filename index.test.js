'use strict';

const compileNodeModulesPlugin = require('./index');

const webpackOptions = {
    dir: 'my-project',
    isServer: false,
    config: {
        distDir: '.next',
        target: 'server',
    },
};

const createWebpackConfigLTE10 = () => ({
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

const createWebpackConfigGT10 = () => ({
    module: {
        rules: [
            {
                test: /\.(tsx|ts|js|mjs|jsx)$/,
                include: ['/path/to/project'],
                exclude: () => {},
                use: [
                    {
                        loader: '@next/react-refresh-utils/loader',
                    },
                    {
                        loader: 'next-babel-loader',
                        options: {
                            isServer: true,
                            hasModern: false,
                            distDir: '/path/to/project/.next',
                            cwd: '/path/to/project',
                            cache: true,
                        },
                    },
                ],
            },
        ],
    },
    externals: () => {},
});

it('should duplicate the default JS rule (webpack <= 10)', () => {
    const config = compileNodeModulesPlugin()().webpack(createWebpackConfigLTE10(), webpackOptions);
    const rule = config.module.rules[1];

    expect(rule.test.toString()).toBe('/\\.js$/');
    expect(rule.include.toString()).toMatch(/\bnode_modules\b/);
    expect(rule.exclude.toString()).toMatch(/\/path\/to\/project/);
    expect(rule.exclude.toString()).toMatch(/\bnode-libs-browser\b/);
    expect(rule.exclude.toString()).toMatch(/\bprocess\b/);
    expect(rule.use).toHaveLength(1);
    expect(rule.use[0].options.distDir).toMatch(/^my-project[\\/]\.next[\\/]cache[\\/]compile-node-modules-plugin$/);
    expect(rule.use[0].options.caller).toEqual({ isNodeModule: true });

    // Test if the first rule is untouched
    expect(config.module.rules[0].include).toEqual(['/path/to/project']);
});

it('should duplicate the default JS rule (webpack > 10)', () => {
    const config = compileNodeModulesPlugin()().webpack(createWebpackConfigGT10(), webpackOptions);
    const rule = config.module.rules[1];

    expect(rule.test.toString()).toBe('/\\.js$/');
    expect(rule.include.toString()).toMatch(/\bnode_modules\b/);
    expect(rule.exclude.toString()).toMatch(/\/path\/to\/project/);
    expect(rule.exclude.toString()).toMatch(/\bnode-libs-browser\b/);
    expect(rule.exclude.toString()).toMatch(/\bprocess\b/);
    expect(rule.use).toHaveLength(2);
    expect(rule.use[0]).toEqual({ loader: '@next/react-refresh-utils/loader' });
    expect(rule.use[1].options.distDir).toMatch(/^my-project[\\/]\.next[\\/]cache[\\/]compile-node-modules-plugin$/);
    expect(rule.use[1].options.caller).toEqual({ isNodeModule: true });

    // Test if the first rule is untouched
    expect(config.module.rules[0].include).toEqual(['/path/to/project']);
});

it('should not have cwd in excludes on the duplicated JS rule', () => {
    const inputConfig = createWebpackConfigLTE10();

    inputConfig.module.rules[0].include.push(process.cwd());

    const config = compileNodeModulesPlugin()().webpack(inputConfig, webpackOptions);
    const rule = config.module.rules[1];

    expect(rule.exclude).not.toContain(process.cwd());
});

it('should not throw if JS rule has no includes', () => {
    const inputConfig = createWebpackConfigLTE10();

    delete inputConfig.module.rules[0].include;

    const config = compileNodeModulesPlugin()().webpack(inputConfig, webpackOptions);
    const rule = config.module.rules[1];

    expect(rule.test.toString()).toBe('/\\.js$/');
});

it('should throw if the JS rule was not found', () => {
    const noGoodRuleConfig = createWebpackConfigLTE10();

    noGoodRuleConfig.module.rules[0].use.loader = 'bad-loader';

    expect(() => compileNodeModulesPlugin()().webpack(noGoodRuleConfig, webpackOptions)).toThrow(/JS rule/);
});

it('should allow to override the rule\'s test & include', () => {
    const options = {
        test: 'my-test',
        include: 'my-include',
        exclude: 'my-exclude',
    };

    const config = compileNodeModulesPlugin(options)().webpack(createWebpackConfigLTE10(), webpackOptions);

    const rule = config.module.rules[1];

    expect(rule.test).toBe('my-test');
    expect(rule.include).toBe('my-include');
});

it('should unshift rule\'s exclude conditions if any', () => {
    const options = {
        exclude: 'my-exclude',
    };

    const config = compileNodeModulesPlugin(options)().webpack(createWebpackConfigLTE10(), webpackOptions);

    const rule = config.module.rules[1];

    expect(rule.exclude.length).toBeGreaterThan(1);
    expect(rule.exclude[0]).toBe('my-exclude');
});

it('should call nextConfig webpack if defined', () => {
    const nextConfig = {
        webpack: jest.fn(() => 'foo'),
    };

    const config = compileNodeModulesPlugin()(nextConfig).webpack(createWebpackConfigLTE10(), webpackOptions);

    expect(nextConfig.webpack).toHaveBeenCalledTimes(1);
    expect(config).toBe('foo');
});

it('should have pre-configured server externals (target = server)', () => {
    const config = compileNodeModulesPlugin()().webpack(createWebpackConfigLTE10(), {
        ...webpackOptions,
        isServer: true,
    });

    expect(config.externals).toMatchSnapshot();
});

it('should have pre-configured server externals (target = serverless-trace)', () => {
    const config = compileNodeModulesPlugin()().webpack(createWebpackConfigLTE10(), {
        ...webpackOptions,
        isServer: true,
        config: {
            ...webpackOptions.config,
            target: 'experimental-serverless-trace',
        },
    });

    expect(config.externals).toMatchSnapshot();
});

it('should unshift custom server externals (target = server, single)', () => {
    const options = {
        serverExternals: 'added-external',
    };

    const config = compileNodeModulesPlugin(options)().webpack(createWebpackConfigLTE10(), {
        ...webpackOptions,
        isServer: true,
    });

    expect(config.externals.length).toBeGreaterThan(1);
    expect(config.externals[0]).toBe('added-external');
});

it('should unshift custom server externals (target = server, array)', () => {
    const options = {
        serverExternals: ['added-external-1', 'added-external-2'],
    };

    const config = compileNodeModulesPlugin(options)().webpack(createWebpackConfigLTE10(), {
        ...webpackOptions,
        isServer: true,
    });

    expect(config.externals.length).toBeGreaterThan(2);
    expect(config.externals[0]).toBe('added-external-1');
    expect(config.externals[1]).toBe('added-external-2');
});

it('should unshift custom server externals (target = serverless-trace, single)', () => {
    const options = {
        serverExternals: 'added-external',
    };

    const config = compileNodeModulesPlugin(options)().webpack(createWebpackConfigLTE10(), {
        ...webpackOptions,
        isServer: true,
        config: {
            ...webpackOptions.config,
            target: 'experimental-serverless-trace',
        },
    });

    expect(config.externals.length).toBeGreaterThan(1);
    expect(config.externals[0]).toBe('added-external');
});

it('should unshift custom server externals (target = serverless-trace, array)', () => {
    const options = {
        serverExternals: ['added-external-1', 'added-external-2'],
    };

    const config = compileNodeModulesPlugin(options)().webpack(createWebpackConfigLTE10(), {
        ...webpackOptions,
        isServer: true,
        config: {
            ...webpackOptions.config,
            target: 'experimental-serverless-trace',
        },
    });

    expect(config.externals.length).toBeGreaterThan(2);
    expect(config.externals[0]).toBe('added-external-1');
    expect(config.externals[1]).toBe('added-external-2');
});

it('should not add "critters" to server externals (target = serverless-trace, experimental.optimizeCss enabled)', () => {
    const config = compileNodeModulesPlugin()().webpack(createWebpackConfigLTE10(), {
        ...webpackOptions,
        isServer: true,
        config: {
            ...webpackOptions.config,
            target: 'experimental-serverless-trace',
            experimental: {
                optimizeCss: true,
            },
        },
    });

    expect(config.externals).not.toContain('critters');
});

it('should leave externals untouched when serverless', () => {
    const options = {
        serverExternals: ['foo', 'bar'],
    };

    const config = compileNodeModulesPlugin(options)().webpack(createWebpackConfigLTE10(), {
        ...webpackOptions,
        isServer: true,
        config: {
            ...webpackOptions.config,
            target: 'serverless',
        },
    });

    expect(typeof config.externals).toBe('function');
});
