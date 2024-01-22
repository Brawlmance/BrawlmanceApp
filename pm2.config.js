module.exports = {
    apps: [
        {
            name: 'brawlmance-api',
            cwd: './packages/api',
            script: 'npm',
            args: 'run start',
            env: {
                NODE_ENV: 'production',
            },
            instances: 1,
        },
        {
            name: 'brawlmance-web',
            cwd: './packages/web',
            script: 'npm',
            args: 'run start',
            env: {
                NODE_ENV: 'production',
            },
            instances: 1,
        },
    ],
}