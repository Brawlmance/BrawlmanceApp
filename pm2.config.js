module.exports = {
    apps: [
        {
            name: 'BrawlmanceAPI',
            cwd: './packages/api',
            script: './packages/api/index.js',
            env: {
                NODE_ENV: 'production',
            },
            watch: true,
            instances: 1,
        },
        {
            name: 'BrawlmanceWeb',
            cwd: './packages/web',
            script: './packages/web/node_modules/next/dist/bin/next-start',
            env: {
                NODE_ENV: 'production',
            },
            watch: true,
            instances: 1,
        },
    ],
}