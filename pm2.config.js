module.exports = {
    apps: [
        {
            name: 'BrawlmanceAPI',
            script: './packages/api/index.js',
            env: {
                NODE_ENV: 'production',
            },
            watch: true,
            instances: 1,
        },
        {
            name: 'BrawlmanceWeb',
            script: './packages/web/__sapper__/build',
            env: {
                NODE_ENV: 'production',
            },
            watch: true,
            instances: 1,
        },
    ],
}