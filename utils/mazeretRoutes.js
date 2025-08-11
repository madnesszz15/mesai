const express = require('express');
const { Mazeret } = require('./database');
const { Client } = require('discord.js');

const router = express.Router();

let client;

router.post('/mazeret', async (req, res) => {
  const { userID, reason } = req.body;
  if (!userID || !reason) {
    return res.status(400).json({ error: 'userID and reason are required' });
  }

  try {
    const mazeret = new Mazeret({ userID, reason });
    await mazeret.save();
    res.status(201).json({ message: 'Mazeret added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error adding mazeret' });
  }
});

router.get('/mazeret/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const mazeretler = await Mazeret.find({ userID: id });
    if (!mazeretler.length) {
      return res.status(404).json({ error: 'No mazerets found for this user' });
    }

    const user = await client.users.fetch(id);
    const username = user ? user.username : 'Unknown User';

    const mazeretList = mazeretler.map(m => `<li>${m.reason} - ${m.timestamp.toLocaleString()}</li>`).join('');

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mazeretler</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #2C2F33;
            color: #FFF;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            padding: 0 20px;
          }
          .container {
            border-left: 5px solid #7289DA;
            border-radius: 8px;
            padding: 20px;
            max-width: 600px;
            width: 100%;
            background-color: #36393F;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            transition: transform 0.3s ease;
          }
          .container:hover {
            transform: scale(1.02);
          }
          h1 {
            font-size: 1.8em;
            margin-bottom: 15px;
            color: #7289DA;
          }
          ul {
            list-style-type: none;
            padding: 0;
          }
          li {
            margin-top: 10px;
            padding: 10px;
            background: #42464D;
            border-radius: 5px;
            border-left: 3px solid #7289DA;
            transition: background 0.3s ease;
          }
          li:hover {
            background: #4E535C;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${username} - Mazeret Listesi</h1>
          <ul>${mazeretList}</ul>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching mazerets' });
  }
});

router.get('/mazeretler', async (req, res) => {
  try {
    const mazeretler = await Mazeret.find();
    if (!mazeretler.length) {
      return res.status(404).json({ error: 'No mazerets found' });
    }

    const mazeretList = await Promise.all(mazeretler.map(async m => {
      const user = await client.users.fetch(m.userID);
      const username = user ? user.username : 'Unknown User';
      return `<li>${username}: ${m.reason} - ${m.timestamp.toLocaleString()}</li>`;
    }));

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tüm Mazeretler</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #2C2F33;
            color: #FFF;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            padding: 0 20px;
          }
          .container {
            border-left: 5px solid #7289DA;
            border-radius: 8px;
            padding: 20px;
            max-width: 600px;
            width: 100%;
            background-color: #36393F;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            transition: transform 0.3s ease;
          }
          .container:hover {
            transform: scale(1.02);
          }
          h1 {
            font-size: 1.8em;
            margin-bottom: 15px;
            color: #7289DA;
          }
          ul {
            list-style-type: none;
            padding: 0;
          }
          li {
            margin-top: 10px;
            padding: 10px;
            background: #42464D;
            border-radius: 5px;
            border-left: 3px solid #7289DA;
            transition: background 0.3s ease;
          }
          li:hover {
            background: #4E535C;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Tüm Kullanıcıların Mazeretleri</h1>
          <ul>${mazeretList.join('')}</ul>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching mazerets' });
  }
});

const setClient = (discordClient) => {
  client = discordClient;
};

module.exports = { router, setClient };
