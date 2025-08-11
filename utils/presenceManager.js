const { ActivityType } = require('discord.js');
const config = require('../settings.json');
const { Mesai } = require('./database');

module.exports = {
  async setBotPresence(client) {
    const onDutyPoliceList = await Mesai.find({ mesaiDurumu: true });
    const onDutyPoliceCount = onDutyPoliceList.length;
    let presenceType = ActivityType.Playing;
    let presenceStatus = 'online';

    switch (config.bot.status.activity.toLowerCase()) {
      case 'playing':
        presenceType = ActivityType.Playing;
        break;
      case 'watching':
        presenceType = ActivityType.Watching;
        break;
      case 'listening':
        presenceType = ActivityType.Listening;
        break;
      case 'streaming':
        presenceType = ActivityType.Streaming;
        break;
      case 'competing':
        presenceType = ActivityType.Competing;
        break;
    }

    switch (config.bot.status.status.toLowerCase()) {
      case 'online':
        presenceStatus = 'online';
        break;
      case 'idle':
        presenceStatus = 'idle';
        break;
      case 'dnd':
        presenceStatus = 'dnd';
        break;
      case 'invisible':
        presenceStatus = 'invisible';
        break;
    }

    if (config.bot.status.activity.toLowerCase() === 'streaming') {
      await client.user.setPresence({
        activities: [
          {
            name: `${config.bot.status.text}`.replace(
              '%onDutyPolice%',
              onDutyPoliceCount
            ),
            type: presenceType,
            url: config.bot.status.twitch,
          },
        ],
        status: presenceStatus,
      });
    } else {
      await client.user.setPresence({
        activities: [
          {
            name: `${config.bot.status.text}`.replace(
              '%onDutyPolice%',
              onDutyPoliceCount
            ),
            type: presenceType,
          },
        ],
        status: presenceStatus,
      });
    }
  },
};
