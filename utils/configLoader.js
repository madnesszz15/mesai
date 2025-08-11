// utils/configLoader.js
const config = require('../settings.json');

module.exports = {
  getConfig() {
    return config;
  },
};
