
import { calculateSeason, getMean, getMedian, getPlayerId } from "../utils";
import type { OddsPlayerData } from "./nhlOdds";
import type { PlayerData } from "./nhlActiveRoster";
import axios, { AxiosResponse } from "axios";

export interface PlayerStats {
  [key: string]: any,
  name: string,
  line: number,
  mean: number,
  median: number,
  over: number,
  under: number,
  rating: number,
}

interface GameData {
    assists: number,
    shots: number,
    points: number,
    goals: number,
    powerPlayGoals: number,
    powerPlayPoints: number,
}

interface PlayerGameData {
  gameLog: GameData[],
}

export default async function getNHLPlayerStats(names: OddsPlayerData[], players: PlayerData, identifier: keyof GameData, gameCount: number) {
  let playerStats: PlayerStats[] = [];
  const season = calculateSeason();

  for (const name in names) {
    const {
      name: playerName,
      line,
      homeTeam,
      awayTeam
    } = names[name]
    const playerOdds = Number(line)
    const {
      id: playerId,
    } = getPlayerId(playerName, players);

    if (!playerId) {
      continue;
    }

    const {
      data: {
        gameLog
      }
    } = await axios.get<any, AxiosResponse<PlayerGameData>>(`https://api-web.nhle.com/v1/player/${playerId}/game-log/${season}/2`);

    if (typeof (gameLog) == 'undefined') {
      continue;
    }

    const lastNGames = gameLog.slice(0, gameCount);
    const dataArr = lastNGames.map((gameData: GameData) => {
      return gameData[identifier];
    }, []);

    if (dataArr.length !== gameCount) {
      continue;
    }

    const mean = getMean(dataArr);
    const median = getMedian(dataArr);
    const over = dataArr.filter(value => value > playerOdds).length;
    const under = dataArr.filter(value => value < playerOdds).length;
    const rating = over + (mean - playerOdds) + (median - playerOdds);

    playerStats.push({
      name: playerName,
      line: playerOdds,
      mean,
      median,
      over,
      under,
      rating,
      homeTeam,
      awayTeam
    });
  }

  return playerStats;
};
