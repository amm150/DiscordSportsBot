import { getSkatersFromRoster } from "../utils";
import type { NHLGameData } from "./nhlGames";
import axios, {AxiosResponse } from "axios";

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
    forwards: RosterPlayerData[],
    defensemen: RosterPlayerData[]
};

export type RosterPlayerData = {
    id: string,
    lastName: {
        default: string,
    },
    firstName: {
        default: string,
    }
}

export interface PlayerData {
    [key: string]: {
        id: string,
    }
}

export default async function getActiveRoster(teams: NHLGameData[]) {
    let players: PlayerData = {};

    for (const team in teams) {
        const {
            homeTeam: {
                abbrev: homeTeamID,
            },
            awayTeam: {
                abbrev: awayTeamID,
            },
        } = teams[team];

        const homeTeamRoster = await axios.get<any, AxiosResponse<RosterData>>(`https://api-web.nhle.com/v1/roster/${homeTeamID}/current`)
        const awayTeamRoster = await axios.get<any, AxiosResponse<RosterData>>(`https://api-web.nhle.com/v1/roster/${awayTeamID}/current`)

        // const [{ splits: [{ stat: homeTeamStats }] }, { splits: [{ stat: homeTeamRanks }] }] = await nhlApi.getTeams({ id: homeTeamID, expand: "stats" } as Options) as unknown as [TeamStatsData, TeamRankData];
        // const [{ splits: [{ stat: awayTeamStats }] }, { splits: [{ stat: awayTeamRanks }] }] = await nhlApi.getTeams({ id: awayTeamID, expand: "stats" } as Options) as unknown as [TeamStatsData, TeamRankData];

        // const homeTeamData = {
        //     shotsAllowed: homeTeamStats.shotsAllowed,
        //     goalsAllowed: homeTeamStats.goalsAgainstPerGame,
        //     shotsAllowedRank: homeTeamRanks.shotsAllowed,
        //     powerPlaysAllowedRank: homeTeamRanks.powerPlayOpportunities,
        //     goalsAllowedRank: homeTeamRanks.goalsAgainstPerGame,
        //     team: awayTeamName,
        //     opponent: homeTeamName,
        // };
        // const awayTeamData = {
        //     shotsAllowed: awayTeamStats.shotsAllowed,
        //     goalsAllowed: awayTeamStats.goalsAgainstPerGame,
        //     shotsAllowedRank: awayTeamRanks.shotsAllowed,
        //     powerPlaysAllowedRank: awayTeamRanks.powerPlayOpportunities,
        //     goalsAllowedRank: awayTeamRanks.goalsAgainstPerGame,
        //     team: homeTeamName,
        //     opponent: awayTeamName,
        // };

        players = {
            ...players,
            ...getSkatersFromRoster(homeTeamRoster.data.forwards, homeTeamRoster.data.defensemen),
            ...getSkatersFromRoster(awayTeamRoster.data.forwards, awayTeamRoster.data.defensemen),
        };
    }
    
    return players;
};
