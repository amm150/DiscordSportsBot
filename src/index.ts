import { Client } from 'discord.js';
import config from './config';
import { helpCommand, pointsCommand, shotsCommand } from './commands';
import dotenv from 'dotenv';
import express from 'express';

const app = express();
const router = express.Router();

dotenv.config();

router.get('/', (_, res) => res.send('Discord Bot is running!'));

app.use('/', router);

app.listen(3000, function() {
  console.log("App server is running on port 3000");
  console.log("to end press Ctrl + C");
});

const { intents, prefix } = config;

const client = new Client({
  intents,
  presence: {
    status: 'online',
    activities: [{
      name: `${prefix}help`,
      type: 'LISTENING'
    }]
  }
});

client.on('ready', () => {
  console.log(`Logged in as: ${client.user?.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith(prefix)) {
    const args = message.content.slice(prefix.length).split(' ');
    const command = args.shift();

    switch (command) {
      case 'shots':
        await shotsCommand(message, args[0]);
        break;

      case 'points':
        await pointsCommand(message, args[0]);
        break;

      case 'help':
        const embed = helpCommand(message);
        embed.setThumbnail(client.user!.displayAvatarURL());
        await message.channel.send({ embeds: [embed] });
        break;
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
