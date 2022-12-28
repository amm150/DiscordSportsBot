import { nhlApi } from "@nhl-api/client";

interface TeamData {
    team: {
        id: string,
        name: string,
    }
}

interface GameData {
    teams: {
        away: TeamData,
        home: TeamData,
    }
}

interface GamesData {
    games: GameData[]
}

export default async function getNHLGames() {
    const date = new Date().toLocaleDateString("en-CA")
    const response = await nhlApi.getSchedule({ date }) as unknown as GamesData;

    const teamIds = response.games.reduce((prevVal: string[], curVal) => {
        return [...prevVal, curVal.teams.away.team.id, curVal.teams.home.team.id];
    }, []);

    return teamIds;
};
