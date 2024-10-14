import axios, { AxiosResponse } from "axios"

export interface TeamData {
    id: string,
    abbrev: string
}

interface GameData {
    awayTeam: TeamData,
    homeTeam: TeamData,
}

interface GameSchedule {
    games: GameData[]
}

interface GamesData {
    gameWeek: GameSchedule[]
}

export interface NHLGameData {
    homeTeam: TeamData,
    awayTeam: TeamData
}

export default async function getNHLGames() {
    let date = new Date().toLocaleDateString("en-CA", {
        timeZone: 'America/New_York',
    });

    const dateArray = date.split("/")
    date = dateArray[2] + "-" + dateArray[0] + "-" + dateArray[1]

    const response = await axios.get<any, AxiosResponse<GamesData>>(`https://api-web.nhle.com/v1/schedule/${date}`)
    const games = response.data.gameWeek[0].games

    const teamIds = games.reduce((prevVal: NHLGameData[], curVal) => {
        const {
            id: homeTeamID,
            abbrev: homeTeamName,
        } = curVal.homeTeam;
        const {
            id: awayTeamID,
            abbrev: awayTeamName,
        } = curVal.awayTeam;

        return [...prevVal, { 
            awayTeam: {
                abbrev: awayTeamName,
                id: homeTeamID,
            },
            homeTeam: {
                abbrev: homeTeamName,
                id: awayTeamID,
            },
        }];
    }, []);

    return teamIds;
};
