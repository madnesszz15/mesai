const express = require('express');
const crypto = require('crypto');
const { Client } = require('discord.js');
const config = require('../settings.json');

const router = express.Router();

const embedData = {};
let client;

const getUserName = async (id) => {
  const user = await client.users.fetch(id);
  return user.username;
};

const getRoleName = async (id) => {
  const role = client.guilds.cache.get(config.guild.id).roles.cache.get(id);
  return role ? `<span style="color:${role.hexColor}">${role.name}</span>` : 'Unknown Role';
};

const processField = async (field) => {
  let value = field.value;
  const userMatches = [...value.matchAll(/<@(\d+)>/g)];
  const roleMatches = [...value.matchAll(/<@&(\d+)>/g)];
  const timeMatches = [...value.matchAll(/<t:(\d+):R>/g)];

  for (const match of userMatches) {
    const userId = match[1];
    const userName = await getUserName(userId);
    value = value.replace(`<@${userId}>`, `@${userName}`);
  }

  for (const match of roleMatches) {
    const roleId = match[1];
    const roleName = await getRoleName(roleId);
    value = value.replace(`<@&${roleId}>`, roleName);
  }

  for (const match of timeMatches) {
    const timestamp = match[1];
    const date = new Date(timestamp * 1000);
    value = value.replace(`<t:${timestamp}:R>`, date.toLocaleString());
  }

  return `
    <div class="embed-field">
      <div class="embed-field-name">${field.name}</div>
      <div class="embed-field-value">${value.split('\n').join('<br>')}</div>
    </div>
  `;
};

router.post('/embed', (req, res) => {
  const embedCode = crypto.randomBytes(4).toString('hex');
  embedData[embedCode] = req.body;
  res.json({ embedCode });
});

router.get('/embed/:code', async (req, res) => {
  const embed = embedData[req.params.code];
  if (!embed) {
    return res.status(404).send('Embed not found');
  }

  const fields = await Promise.all(embed.fields.map(processField));

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Discord Embed</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #2C2F33;
          color: #FFF;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          padding: 0 20px;
        }
        .embed {
          border-left: 4px solid ${embed.color || '#7289DA'};
          border-radius: 10px;
          padding: 20px;
          max-width: 600px;
          width: 100%;
          background-color: #36393F;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
        }
        .embed-author {
          font-weight: bold;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
        }
        .embed-author img {
          border-radius: 50%;
          margin-right: 10px;
        }
        .embed-field {
          margin-top: 10px;
        }
        .embed-field-name {
          font-weight: bold;
          color: #7289DA;
        }
        .embed-field-value {
          margin-top: 5px;
        }
        .embed-footer {
          font-size: 0.9em;
          color: #99AAB5;
          margin-top: 10px;
          text-align: right;
        }
        .embed-description {
          margin-bottom: 10px;
        }
      </style>
    </head>
    <body>
      <div class="embed">
        <div class="embed-author">
          <img src="${embed.author.icon_url}" alt="${embed.author.name}" width="32" height="32">
          ${embed.author.name}
        </div>
        ${fields.join('')}
        <div class="embed-footer">${embed.footer.text}</div>
      </div>
    </body>
    </html>
  `);
});

const setClient = (discordClient) => {
  client = discordClient;
};

module.exports = { router, setClient };
