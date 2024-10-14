import { Intents } from 'discord.js';

export default {
  prefix: '!',
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
  ],
}