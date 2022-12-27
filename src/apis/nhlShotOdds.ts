import cheerio from "cheerio";
import axios from 'axios';
import config from "../config";

export interface OddsPlayerData {
    name: string,
    line: string,
}

export default async function getPlayerShotOdds() {
    const { data } = await axios.get(config.shotsURL);
    const $ = cheerio.load(data);

    const listItems = $('.sportsbook-table__body tr');

    const players: OddsPlayerData[] = [];

    listItems.each((_idx, el) => {
        const name = $(el).find('.sportsbook-row-name').text();
        const line = $(el).find('.sportsbook-outcome-cell__line').first().text();

        players.push({
            name,
            line,
        });
    });

    return players;
};
