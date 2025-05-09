import { ObjectId } from "mongodb";

export interface Character {
    _id: string;
    name: string;
    wikiUrl: string;
    race: string;
    birth: string;
    gender: string;
    death: string;
    hair: string;
    spouse: string;
}

export interface PlayerInfo {
    _id?: ObjectId
    username: string,
    name: string,
    password: string,
    email: string,
    level: number,
    imageUrl: string,
    exp: number,
    requiredExp: number,
    favoritedQuotes: Quote[],
    blacklistedQuotes: Quote[],
    hsSd: number,
    hs10: number,
    hsTq: number
}

export interface Quote {
    _id: string;
    dialog: string;
    movie: string;
    character: string;
}