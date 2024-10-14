import { Message, MessageEmbed } from 'discord.js';
import getActiveRoster from './apis/nhlActiveRoster';
import getNHLGames from './apis/nhlGames';
import getNHLPlayerStats from './apis/nhlPlayerStats';
import getPlayerOdds from './apis/nhlOdds';
import config from './config';
import { buildMessageEmbed } from './utils';

const { prefix } = config;

const commands: { [name: string]: { aliases?: string[]; description: string; format: string } } = {
  'help': {
    description: 'Shows the list of commands and their details.',
    format: 'help'
  },
  'shots': {
    description: 'Shows NHL shot consistency data for last (X) amount of games. (Default is 10 games)',
    format: 'shots <# of games>'
  },
  'points': {
    description: 'Shows NHL points consistency data for last (X) amount of games. (Default is 10 games)',
    format: 'points <# of games>'
  },
}

export async function shotsCommand(message: Message, gameCount: string = '10') {
  const msg = await message.reply('Fetching data...');

  const teams = await getNHLGames();
  const players = await getActiveRoster(teams);
  const playerShotOdds = await getPlayerOdds("player_shots_on_goal");
  const playerStats = await getNHLPlayerStats(playerShotOdds, players, 'shots', Number(gameCount));
  const playersSorted = playerStats.sort(function(a,b){return a.rating - b.rating}).reverse().slice(0, 8);

  const embed = buildMessageEmbed(message, playersSorted, gameCount, 'shots');

  await msg.edit({ embeds: [embed] });
}

export async function pointsCommand(message: Message, gameCount: string = '10') {
  const msg = await message.reply('Fetching data...');

  const teams = await getNHLGames();
  const players = await getActiveRoster(teams);
  const playerPointsOdds = await getPlayerOdds("player_points");
  const playerStats = await getNHLPlayerStats(playerPointsOdds, players, 'points', Number(gameCount));
  const playersSorted = playerStats.sort(function(a,b){return a.rating - b.rating}).reverse().slice(0, 8);
  console.log(playerPointsOdds)

  const embed = buildMessageEmbed(message, playersSorted, gameCount, 'points');

  await msg.edit({ embeds: [embed] });
}

export function helpCommand(message: Message) {
  const footerText = message.author.tag;
  const footerIcon = message.author.displayAvatarURL();
  const embed = new MessageEmbed()
    .setTitle('HELP MENU')
    .setColor('GREEN')
    .setFooter({ text: footerText, iconURL: footerIcon });

  for (const commandName of Object.keys(commands)) {
    const command = commands[commandName];
    let desc = command.description + '\n\n';
    if (command.aliases) desc += `**Aliases :** ${command.aliases.join(', ')}\n\n`;
    desc += '**Format**\n```\n' + prefix + command.format + '```';

    embed.addField(commandName, desc, false);
  }

  return embed;
}