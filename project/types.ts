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

export interface Quote {
    _id: string;
    dialog: string;
    movie: string;
    character: string;
}