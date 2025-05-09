import { Collection, MongoClient, ObjectId } from "mongodb";
import { PlayerInfo, Quote} from "../../types";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

export const URI = process.env.URI!;

const CLIENT = new MongoClient(URI);
export const userCollection: Collection = CLIENT.db("wpl").collection("users");

export async function findByX(user: PlayerInfo | undefined, input: string, field: "username" | "email") {
    if (user) {
        const email = await userCollection.findOne({[field]: input, _id: { $ne: new ObjectId(user._id) }})
            if (email) {
                return true;
            }
        }
    return false;
}

export async function updateProfile(player: PlayerInfo | undefined) {
    //Mijn idee is om ook ineens gewoon deze functie te kunnen gebruiken bij update gegevens en voor het uitloggen om de db te syncen
    if (player) {
        const updateOne = await userCollection.updateOne({ _id: new ObjectId(player._id) }, 
            { $set: 
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
                    hsSd: player.hsSd,
                    hs10: player.hs10,
                    hsTq: player.hsTq
                }
            })
        // console.log(`Gevonden: ${updateOne.matchedCount}, Aangepast: ${updateOne.modifiedCount}`); -- debug
    }
}

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

export async function checkLogin(username: string, password: string){
    const existingPlayer = await userCollection.findOne({ $or: [{email: username}, {username: username}] }) as PlayerInfo | null;
    console.log(existingPlayer)
    if (!existingPlayer) {
        return
    }
    const checkPassword = await bcrypt.compare(password, existingPlayer.password)
    if (!checkPassword) {
        return
    }
    return existingPlayer
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