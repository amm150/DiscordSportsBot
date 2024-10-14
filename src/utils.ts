import { Message, MessageEmbed } from 'discord.js';
import type { PlayerData, RosterPlayerData } from './apis/nhlActiveRoster';
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
        if (!players[formattedName]) {
            throw new Error(`Player name does NOT match ${formattedName}`)
        }

        return {
            id: players[formattedName].id,
            name: formattedName,
        };
    } catch (e) {
        console.log(e);
        let playerId = players[formattedName]?.id;
        let playerName = formattedName;

        if (!playerId) {
            const fullName = formattedName.split(' ');
            const firstName = fullName[0];
            const lastName = fullName[1];

            for (const i in nameMap) {
                if (nameMap[i][0] === firstName) {
                    const updatedName = `${nameMap[i][1]} ${lastName}`;
                    playerId = players[updatedName]?.id;
                    playerName = updatedName;
                    break;
                } else if (nameMap[i][1] === firstName) {
                    const updatedName = `${nameMap[i][0]} ${lastName}`;
                    playerId = players[updatedName]?.id;
                    playerName = updatedName;
                    break;
                }
            }
        }

        return {
        id: playerId,
        name: playerName,
        };
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
            `${playerStat.name} - (${playerStat.homeTeam} @ ${playerStat.awayTeam})`,
            `Line:   ${playerStat.line}
            Over:   ${playerStat.over}
            Under:  ${playerStat.under}
            Mean:  ${playerStat.mean}`
        )
    });

    return embed;
}

// export interface TeamStats {
//     shotsAllowed: number,
//     goalsAllowed: number,
//     shotsAllowedRank: string,
//     powerPlaysAllowedRank: string,
//     goalsAllowedRank: string,
//     team: string,
//     opponent: string,
// }

export const getSkatersFromRoster = (forwards: RosterPlayerData[], defensemen: RosterPlayerData[]) => {
    let skaters: PlayerData = {};
    // TODO make function to reduce duplication
    forwards.reduce((prevPlayers: PlayerData, curPlayer) => {
        let playerName = `${curPlayer.firstName.default} ${curPlayer.lastName.default}`
        skaters[playerName] = {
            id: curPlayer.id,
        };

        return prevPlayers;
    }, {});

    defensemen.reduce((prevPlayers: PlayerData, curPlayer) => {
        let playerName = `${curPlayer.firstName.default} ${curPlayer.lastName.default}`
        skaters[playerName] = {
            id: curPlayer.id,
        };

        return prevPlayers;
    }, {});

    return skaters;
}
