const { setBotPresence } = require('../utils/presenceManager');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`Logged in as ${client.user.tag}!`);
    setBotPresence(client); 
  },
};
