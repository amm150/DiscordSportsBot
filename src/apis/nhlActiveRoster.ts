import { nhlApi } from "@nhl-api/client";
import type { Options } from "@nhl-api/client/lib/src/util";

type RosterData = {
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
    }
}

export default async function getActiveRoster(teams: string[]) {
    let players: PlayerData = {};

    for (const team in teams) {
        const response = await nhlApi.getTeams({ id: teams[team], expand: "roster" } as Options) as unknown as RosterData;

        response.reduce((prevPlayers: PlayerData, curPlayer) => {
            // Ignore goalies
            if (curPlayer.position.code !== "G") {
                players[curPlayer.person.fullName] = {
                    id: curPlayer.person.id,
                };
            }

            return prevPlayers;
        }, {});
    }
    
    return players;
};
