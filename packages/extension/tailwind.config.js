/* eslint-disable @typescript-eslint/no-var-requires */
const config = require('@dailydotdev/shared/tailwind.config');

module.exports = {
  ...config,
  purge: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@dailydotdev/shared/src/**/*.{js,ts,jsx,tsx}',
  ],
};
