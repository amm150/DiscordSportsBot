import { Intents } from 'discord.js';

export default {
  prefix: '!',
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
  ],
  pointsURL: 'https://sportsbook.draftkings.com/leagues/hockey/nhl?category=player-props&subcategory=points',
  shotsURL: 'https://sportsbook.draftkings.com/leagues/hockey/nhl?wpsrc=Organic+Search&wpaffn=Google&wpkw=https%3A%2F%2Fsportsbook.draftkings.com%2Fleagues%2Fhockey%2F88670853%3Fcategory%3Dawards&wpcn=leagues&wpscn=hockey%2F88670853&category=shots-on-goal&subcategory=player-shots-on-goal',
}
