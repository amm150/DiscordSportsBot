import { nhlApi } from "@nhl-api/client";

export interface TeamData {
    id: string,
    name: string,
}

interface GameData {
    teams: {
        away: {
            team: TeamData,
        },
        home: {
            team: TeamData,
        }
    }
}

interface GamesData {
    games: GameData[]
}

export interface NHLGameData {
    home: TeamData,
    away: TeamData
}

export default async function getNHLGames() {
    const date = new Date().toLocaleDateString("en-CA", {
        timeZone: 'America/New_York',
    });
    const response = await nhlApi.getSchedule({ date }) as unknown as GamesData;

    const teamIds = response.games.reduce((prevVal: NHLGameData[], curVal) => {
        const {
            id: homeTeamID,
            name: homeTeamName,
        } = curVal.teams.home.team;
        const {
            id: awayTeamID,
            name: awayTeamName,
        } = curVal.teams.away.team;

        return [...prevVal, { 
            away: {
                name: homeTeamName,
                id: homeTeamID,
            },
            home: {
                name: awayTeamName,
                id: awayTeamID,
            },
        }];
    }, []);

    return teamIds;
};
