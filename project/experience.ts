import { PlayerInfo } from "./types"
//ALLES HIER IS GEWOON TEMPORARY OM EEN LEVEL SYSTEEM TE TESTEN

export function addExp(player: PlayerInfo, experience: number): PlayerInfo {
    player.exp += experience
    if (player.exp >= player.requiredExp) {
        player.exp -= player.requiredExp
        player.level += 1
        player.requiredExp = Math.floor(player.requiredExp * 1.2)
    }
    return player
}

export function ExpPercentage(player: PlayerInfo): number {
    const percentage = (player.exp / player.requiredExp) * 100
    return Math.min(100, Math.floor(percentage))
}

export function calculateExp10(number: number) {
    return 10 + (number * 5) //i dunno?? 5xp per juiste vraag + 10 om de quiz te finishen?
}

export function calculateSuddenDeath(number: number) {
    let standardExp: number = number * 5
    let bonusEXp: number = 0;

    if (number >= 5) {
        bonusEXp = number * 5
    } else if (number >= 3) {
        bonusEXp = number * 2
    }

    return standardExp + bonusEXp
}

export function calculateTimedQuiz(number: number) {
    let standardExp: number = number * 10
    let bonusEXp: number = 0;

    if (number >= 10) {
        bonusEXp += (standardExp - 9) * 2 + 20 //Dus alle antwoorden boven de 10 is 2 punten extra per ronde + extra bonus van 20 om 10 te halen??
    } else if (number >= 5) {
        bonusEXp += 15
    }

    return standardExp + bonusEXp
}