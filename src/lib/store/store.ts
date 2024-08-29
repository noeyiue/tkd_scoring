import { configureStore } from "@reduxjs/toolkit";
import scoreboardSlice from "./features/scoreboardSlice";


export const store = () => {
  return configureStore({
    reducer: {
        scoreboard: scoreboardSlice,
    },
  });
};

export type AppStore = ReturnType<typeof store>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
