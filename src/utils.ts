import { getPlayerId as getPlayerByName } from '@nhl-api/players';
import { Message, MessageEmbed } from 'discord.js';
import type { PlayerData } from './apis/nhlActiveRoster';
import type { PlayerStats } from './apis/nhlPlayerStats';

export const calculateSeason = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();

    // season should be the year that the season started and ended. So for 2022/2023 season this should be "20222023".
    const season = month > 7 ? `${year}${year + 1}` : `${year - 1}${year}`;

    return season;
}

// Some names are different between the NHL Api and Draftkings....
const nameMap = [
    ['Matthew', 'Matt']
];

export const getPlayerId = (name: string, players: PlayerData) => {
    const formattedName = name.replace(/ *\([^)]*\) */g, "");

    try {
        const playerId = getPlayerByName(formattedName);

        if(Array.isArray(playerId)) {
            throw new Error(`Found multiple player IDs for ${formattedName}`)
        }

        return playerId;
    } catch (e) {
        console.log(e);
        let playerId = players[formattedName]?.id;

        if(!playerId) {
            const fullName = formattedName.split(' ');
            const firstName = fullName[0];
            const lastName = fullName[1];
    
            for(const i in nameMap) {
                if(nameMap[i][0] === firstName) {
                    const updatedName = `${nameMap[i][1]} ${lastName}`;
                    playerId = players[updatedName]?.id;
                    break;
                } else if (nameMap[i][1] === firstName) {
                    const updatedName = `${nameMap[i][0]} ${lastName}`;
                    playerId = players[updatedName]?.id;
                    break;
                }
            }
        }

        return playerId;
    }
}

export const getMedian = function(array: number[]) {
    array.sort(function(a, b) {
      return a - b;
    });
    var mid = array.length / 2;
    return mid % 1 ? array[mid - 0.5] : (array[mid - 1] + array[mid]) / 2;
};

export const getMean = (array: number[]) => Math.round((array.reduce((a, b) => a + b) / array.length) * 100) / 100;

export const buildMessageEmbed = (message: Message, playerStats: PlayerStats[], gameCount: string, command: string) => {
    const footerText = message.author.tag;
    const footerIcon = message.author.displayAvatarURL();
    const embed = new MessageEmbed()
      .setTitle(`${command.toLocaleUpperCase()} Data for last ${gameCount} games`)
      .setColor('GREEN')
      .setFooter({ text: footerText, iconURL: footerIcon });

    playerStats.forEach((playerStat) => {
        embed.addField(
            playerStat.name,
            `Line:   ${playerStat.line} \nOver:   ${playerStat.over} \nUnder:  ${playerStat.under} \nMean:  ${playerStat.mean} \nMedian:  ${playerStat.median}`
        )
    });

    return embed;
}
