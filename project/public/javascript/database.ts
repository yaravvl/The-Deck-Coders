import { Collection, MongoClient } from "mongodb";
import { PlayerInfo, Quote} from "../../types";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

const URI = process.env.URI!;

const CLIENT = new MongoClient(URI);
export const userCollection: Collection = CLIENT.db("wpl").collection("users");

async function exit(){
    try {
        await CLIENT.close();
        console.log("Closing database connection.")
    } catch (e) {
        console.error(e)
    } finally {
        process.exit(0)
    }
}

export async function checkLogin(username: string, password: string): Promise<boolean>{
    const existingPlayer = await userCollection.findOne({ username });
    if (!existingPlayer) {
        return false
    }
    const checkPassword = await bcrypt.compare(password, existingPlayer.password)
    if (!checkPassword) {
        return false
    } else {
        return true
    }
}

export async function checkExistingPlayer(email: string, username: string): Promise<boolean>{
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
        hsSd: 0,
        hs10: 0,
        hsTq: 0
    }
    return newUser
}

export async function connect() {
    try {
        await CLIENT.connect();
        console.log("Connected to the database.");
        process.on("SIGINT", exit)
    } catch (e) {
        console.error(e)
        process.exit(0)
    }
}