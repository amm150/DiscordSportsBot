import { Client } from 'discord.js';
import config from './config';
import { helpCommand, pointsCommand, shotsCommand } from './commands';
import dotenv from 'dotenv';

dotenv.config();

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

    switch(command) {
      case 'shots':
        await shotsCommand(message, args[0]);
        break;

      case 'points':
        await pointsCommand(message, args[0]);
        break;

      // case 'say':
      // case 'repeat':
      //   if (args.length > 0) await message.channel.send(args.join(' '));
      //   else await message.reply('You did not send a message to repeat, cancelling command.');
      //   break;

      case 'help':
        const embed = helpCommand(message);
        embed.setThumbnail(client.user!.displayAvatarURL());
        await message.channel.send({ embeds: [embed] });
        break;
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
