import { nhlApi } from "@nhl-api/client";
import { calculateSeason, getMean, getMedian, getPlayerId } from "../utils";
import type { OddsPlayerData } from "./nhlShotOdds";
import type { PlayerData } from "./nhlActiveRoster";

export interface PlayerStats {
    [key: string]: any,
    name: string,
    line: number,
    mean: number,
    median: number,
    over: number,
    under: number,
    rating: number,
    team: string,
    opponent: string,
    allowed: number,
    allowedRank: string,
    powerPlaysRank: string,
}

interface GameData {
    stat: {
        assists: number,
        shots: number,
        points: number,
        goals: number,
        hits: number,
        blocked: number,
    }
}

interface PlayerGameData {
    splits: GameData[],
}

export default async function getNHLPlayerStats(names: OddsPlayerData[], players: PlayerData, identifier: keyof GameData['stat'], gameCount: number) {
    let playerStats: PlayerStats[] = [];
    const season = calculateSeason();

    for (const name in names) {
        const playerName = names[name].name;
        const playerOdds = Number(names[name].line);
        const {
            id: playerId,
            name: playerNameFormatted,
        } = getPlayerId(playerName, players);

        if(!playerId) {
            continue;
        }

        const {
            splits
        } = await nhlApi.getPlayer({
            id: playerId,
            stats: "gameLog",
            season: season,
        }) as unknown as PlayerGameData;

        const lastNGames = splits.slice(0, gameCount);
        const dataArr = lastNGames.map((gameData: GameData) => {
            return gameData.stat[identifier];
        }, []);

        if(dataArr.length !== gameCount) {
            continue;
        }

        const mean =  getMean(dataArr);
        const median = getMedian(dataArr);
        const over = dataArr.filter(value => value > playerOdds).length;
        const under = dataArr.filter(value => value < playerOdds).length;
        const rating =  over + (mean - playerOdds) + (median - playerOdds);
        const {
            shotsAllowed,
            goalsAllowed,
            shotsAllowedRank,
            goalsAllowedRank,
            powerPlaysAllowedRank,
            team,
            opponent,
        } = players[playerNameFormatted];
        const isShots = identifier === "shots";
    

        playerStats.push({
            name: playerName,
            line: playerOdds,
            mean,
            median,
            over,
            under,
            rating,
            team,
            opponent,
            allowed: isShots ? shotsAllowed : goalsAllowed,
            allowedRank: isShots ? shotsAllowedRank : goalsAllowedRank,
            powerPlaysRank: powerPlaysAllowedRank,
        });
    }
    
    return playerStats;
};
