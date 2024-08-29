export interface IScoreboard {

    blueScore : number,
    blueTech : number[],
    blueGamjeom : number,
    blueWinRound : number,
    blueScores : number[],

    redScore : number,
    redTech : number[],
    redGamjeom : number,
    redWinRound : number,
    redScores : number[],
}

export type TkdColor = "red" | "blue";