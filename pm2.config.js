module.exports = {
    apps: [
        {
            name: 'BrawlmanceAPI',
            cwd: './packages/api',
            script: 'npm',
            args: 'run start',
            env: {
                NODE_ENV: 'production',
            },
            instances: 1,
        },
        {
            name: 'BrawlmanceWeb',
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