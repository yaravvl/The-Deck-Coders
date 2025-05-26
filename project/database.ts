import { Collection, MongoClient, ObjectId } from "mongodb";
import { PlayerInfo, Quote, Movie } from "./types";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

export const URI = process.env.URI!;

const CLIENT = new MongoClient(URI);
export const userCollection: Collection = CLIENT.db("wpl").collection("users");
const movieCollection: Collection<Movie> = CLIENT.db("wpl").collection("movies")

export async function findByX(user: PlayerInfo | undefined, input: string, field: "username" | "email") {
    if (user) {
        const email = await userCollection.findOne({ [field]: input, _id: { $ne: new ObjectId(user._id) } })
        if (email) {
            return true;
        }
    }
    return false;
}

export async function find10Highscores() {
    return userCollection.find({}).sort({tenRoundsHs: -1}).limit(3).toArray();
}

export async function findSdHighscores() {
    return userCollection.find({}).sort({suddenDeathHs: -1}).limit(3).toArray();
}

export async function findTqHighscores() {
    return userCollection.find({}).sort({timedQuizHs: -1}).limit(3).toArray();
}

export async function addQuoteToFavorites(quote: Quote, player: PlayerInfo) {
    if (player) {
        player.favoritedQuotes.push(quote)
    }
}

export async function addQuoteToBlacklist(quote: Quote, player: PlayerInfo, bqReason: string) {
    if (player) {
        player.blacklistedQuotes.push({
            _id: quote._id,
            dialog: quote.dialog,
            movie: quote.movie,
            character: quote.character,
            id: quote.id,
            reason: bqReason,
        })
    }
}

async function moviesToDatabase() {
    if (await movieCollection.countDocuments() === 0) {
        const movies = await fetch("http://localhost:3000/data/movies.json")
        const data: Movie[] = await movies.json()

        movieCollection.insertMany(data);
    }
}

export async function getAllMovies(){
    return movieCollection.find({}).toArray()
}

export async function findMovieInDatabase(id: string) {
    return movieCollection.findOne({id: id})
}

export async function updateProfile(player: PlayerInfo | undefined) {
    //Mijn idee is om ook ineens gewoon deze functie te kunnen gebruiken bij update gegevens en voor het uitloggen om de db te syncen
    if (player) {
        const updateOne = await userCollection.updateOne({ _id: new ObjectId(player._id) },
            {
                $set:
                {
                    username: player.username,
                    name: player.name,
                    level: player.level,
                    email: player.email,
                    password: player.password,
                    imageUrl: player.imageUrl,
                    exp: player.exp,
                    requiredExp: player.requiredExp,
                    favoritedQuotes: player.favoritedQuotes,
                    blacklistedQuotes: player.blacklistedQuotes,
                    tenRoundsHs: player.tenRoundsHs,
                    suddenDeathHs: player.suddenDeathHs,
                    timedQuizHs: player.timedQuizHs
                }
            })
        // console.log(`Gevonden: ${updateOne.matchedCount}, Aangepast: ${updateOne.modifiedCount}`); -- debug
    }
}

async function exit() {
    try {
        await CLIENT.close();
        console.log("Closing database connection.")
    } catch (e) {
        console.error(e)
    } finally {
        process.exit(0)
    }
}

export async function checkLogin(username: string, password: string) {
    const existingPlayer = await userCollection.findOne({ $or: [{ email: username }, { username: username }] }) as PlayerInfo | null;
    // console.log(existingPlayer) -- debug
    if (!existingPlayer) {
        return
    }
    const checkPassword = await bcrypt.compare(password, existingPlayer.password)
    if (!checkPassword) {
        return
    }
    return existingPlayer
}

export async function checkExistingPlayer(email: string, username: string): Promise<boolean> {
    const existingPlayer = await userCollection.findOne({ $or: [{ email }, { username }] });
    if (existingPlayer) {
        return true;
    } else {
        return false;
    }
}

export async function addUser(user: PlayerInfo) {
    userCollection.insertOne(user)
}

export function createPlayer(username: string, password: string, email: string, image_url: string): PlayerInfo {
    const newUser: PlayerInfo = {
        username: username,
        name: "",
        password: password,
        email: email,
        level: 1,
        imageUrl: image_url,
        exp: 0,
        requiredExp: 100,
        favoritedQuotes: [],
        blacklistedQuotes: [],
        tenRoundsHs: 0,
        suddenDeathHs: 0,
        timedQuizHs: 0
    }
    return newUser
}

export async function connect() {
    try {
        await CLIENT.connect();
        console.log("Connected to the database.");
        process.on("SIGINT", exit)
        moviesToDatabase()
    } catch (e) {
        console.error(e)
        process.exit(0)
    }
}