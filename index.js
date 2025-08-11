const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const mongoose = require('mongoose');
const express = require('express');
const config = require('./settings.json');
const { router: embedRouter, setClient: setEmbedClient } = require('./utils/embedRoutes');
const { router: mazeretRouter, setClient: setMazeretClient } = require('./utils/mazeretRoutes');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,  // Bunu ekle!
  ],
});

mongoose.connect(config.bot.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected successfully.');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

const commands = [];
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(config.bot.token);
(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(config.bot.id, config.guild.id),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

client.login(config.bot.token);

const app = express();
const port = config.web.port;

app.use(express.json());
app.use('/', embedRouter);
app.use('/', mazeretRouter);

app.listen(port, () => {
  console.log(`Server is running at ${config.web.hostname}${port}`);
});

setEmbedClient(client);
setMazeretClient(client);
