module.exports = {
    apps: [
        {
            name: 'BrawlmanceAPI',
            cwd: './packages/api',
            script: 'npm run start',
            env: {
                NODE_ENV: 'production',
            },
            watch: true,
            instances: 1,
        },
        {
            name: 'BrawlmanceWeb',
            cwd: './packages/web',
            script: 'npm run start',
            env: {
                NODE_ENV: 'production',
            },
            watch: true,
            instances: 1,
        },
    ],
}