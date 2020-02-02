// next.config.js
const withImages = require('next-images')
module.exports = {
  ...withImages(),
  publicRuntimeConfig: {
    NODE_ENV: process.env.NODE_ENV,
  },
  env: {
    NODE_ENV: process.env.NODE_ENV,
  },
}
