import axios, { AxiosResponse } from 'axios';

export interface OddsPlayerData {
    name: string,
    line: string,
    homeTeam: string,
    awayTeam: string,
}

interface EventsData {
    id: string
}

interface PlayerOddsData {
    home_team: string
    away_team: string
    bookmakers: BookOddData[]
}

interface BookOddData {
    key: string,
    markets: Markets[]
}

interface Markets {
    outcomes: PlayerOdds[]
}

interface PlayerOdds {
    name: string,
    description: string,
    price: number,
    point: number
}

export default async function getPlayerOdds(market: string) {
    const now = new Date();
    const commenceTimeTo = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString().split(".")[0] + "Z"

    const events = await axios.get<any, AxiosResponse<EventsData[]>>(`https://api.the-odds-api.com/v4/sports/icehockey_nhl/events?apiKey=${process.env.ODDS_API_KEY}&commenceTimeTo=${commenceTimeTo}`)

    const players: OddsPlayerData[] = [];

    for (const event of events.data) {
        const playerOdds = await axios.get<any, AxiosResponse<PlayerOddsData>>(`https://api.the-odds-api.com/v4/sports/icehockey_nhl/events/${event.id}/odds?apiKey=${process.env.ODDS_API_KEY}&regions=us&oddsFormat=american&markets=${market}`)
        const bookData = playerOdds.data.bookmakers.find(bookData => bookData.key === "fanduel")

        if (typeof(bookData) !== "undefined") {
            const homeTeam = playerOdds.data.home_team
            const awayTeam = playerOdds.data.away_team
            bookData.markets[0].outcomes.forEach((data) => {
                if (data.name === "Over") {
                    players.push({
                        name: data.description,
                        line: String(data.point),
                        homeTeam: homeTeam,
                        awayTeam: awayTeam,
                    })
                }
            })
        }
    }

    return players;
};
