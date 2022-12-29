import { nhlApi } from "@nhl-api/client";
import type { Options } from "@nhl-api/client/lib/src/util";
import { getSkatersFromRoster } from "../utils";
import type { NHLGameData } from "./nhlGames";

export interface TeamStatsData {
    splits: {
        stat: {
            shotsAllowed: number,
            goalsAgainstPerGame: number,
        }
    }[]
}

export interface TeamRankData {
    splits: {
        stat: {
            shotsAllowed: string,
            powerPlayOpportunities: string,
            goalsAgainstPerGame: string
        }
    }[]
}

export type RosterData = {
    person: {
        id: string,
        fullName: string,
    },
    position: {
        code: string,
        name: string,
        type: string,
    }
}[];

export interface PlayerData {
    [key: string]: {
        id: string,
        opponent: string,
        team: string,
        shotsAllowed: number,
        goalsAllowed: number,
        shotsAllowedRank: string,
        powerPlaysAllowedRank: string,
        goalsAllowedRank: string,
    }
}

export default async function getActiveRoster(teams: NHLGameData[]) {
    let players: PlayerData = {};

    for (const team in teams) {
        const {
            home: {
                id: homeTeamID,
                name: homeTeamName,
            },
            away: {
                id: awayTeamID,
                name: awayTeamName,
            },
        } = teams[team];

        const homeTeamRoster = await nhlApi.getTeams({ id: homeTeamID, expand: "roster" } as Options) as unknown as RosterData;
        const awayTeamRoster = await nhlApi.getTeams({ id: awayTeamID, expand: "roster" } as Options) as unknown as RosterData;

        const [{ splits: [{ stat: homeTeamStats }] }, { splits: [{ stat: homeTeamRanks }] }] = await nhlApi.getTeams({ id: homeTeamID, expand: "stats" } as Options) as unknown as [TeamStatsData, TeamRankData];
        const [{ splits: [{ stat: awayTeamStats }] }, { splits: [{ stat: awayTeamRanks }] }] = await nhlApi.getTeams({ id: awayTeamID, expand: "stats" } as Options) as unknown as [TeamStatsData, TeamRankData];

        const homeTeamData = {
            shotsAllowed: homeTeamStats.shotsAllowed,
            goalsAllowed: homeTeamStats.goalsAgainstPerGame,
            shotsAllowedRank: homeTeamRanks.shotsAllowed,
            powerPlaysAllowedRank: homeTeamRanks.powerPlayOpportunities,
            goalsAllowedRank: homeTeamRanks.goalsAgainstPerGame,
            team: awayTeamName,
            opponent: homeTeamName,
        };
        const awayTeamData = {
            shotsAllowed: awayTeamStats.shotsAllowed,
            goalsAllowed: awayTeamStats.goalsAgainstPerGame,
            shotsAllowedRank: awayTeamRanks.shotsAllowed,
            powerPlaysAllowedRank: awayTeamRanks.powerPlayOpportunities,
            goalsAllowedRank: awayTeamRanks.goalsAgainstPerGame,
            team: homeTeamName,
            opponent: awayTeamName,
        };

        players = {
            ...players,
            ...getSkatersFromRoster(homeTeamRoster, awayTeamData),
            ...getSkatersFromRoster(awayTeamRoster, homeTeamData),
        };
    }
    
    return players;
};
