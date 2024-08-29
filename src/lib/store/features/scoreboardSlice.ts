import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IScoreboard, TkdColor } from "./IscoreboardSlice";

const initialState: IScoreboard = {
  blueScore: 0,
  blueTech: [0, 0, 0, 0, 0],
  blueGamjeom: 0,
  blueWinRound: 0,
  blueScores: [0, 0, 0],

  redScore: 0,
  redTech: [0, 0, 0, 0, 0],
  redGamjeom: 0,
  redWinRound: 0,
  redScores: [0, 0, 0],
};

export const scoreboardSlice = createSlice({
  name: "scoreboard",
  initialState,
  reducers: {
    updateScore: (state, action: PayloadAction<{ color: TkdColor; score: number; isGamjeom: boolean }>) => {
      const { color, score, isGamjeom } = action.payload;
      if (!isGamjeom) {
        if (color === "blue") {
          state.blueScore += score;
          state.blueTech[score-1] += 1;
        } else if (color === "red") {
          state.redScore += score;
          state.redTech[score-1] += 1;
        }
      } else {
        if (color === "blue") {
          state.blueScore += score;
        } else if (color === "red") {
          state.redScore += score;
        }
      }
    },
    resetScore: (state, action: PayloadAction<TkdColor>) => {
        if (action.payload === "blue") {
            state.blueScore = 0;
            state.blueTech = [0,0,0,0,0];
        } else if (action.payload === "red") {
            state.redScore = 0;
            state.redTech = [0,0,0,0,0];
        }
    }
  },
});

export const { updateScore, resetScore } = scoreboardSlice.actions;
export default scoreboardSlice.reducer;