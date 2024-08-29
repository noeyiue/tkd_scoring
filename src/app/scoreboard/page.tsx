"use client";

import { WEBSOCKET_ENDPOINT } from "@/lib/constants/routes";
import { TkdColor } from "@/lib/store/features/IscoreboardSlice";
import { resetScore, updateScore } from "@/lib/store/features/scoreboardSlice";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

type IControllerData = {
  color: TkdColor,
  score: number,
}

type IPointAction = {
  bluePoint: number;
  redPoint: number;
  techIndex: number;
};

function Page() {
  const dispatch = useAppDispatch();

  const match_num = 401;
  const age = "CADETS";
  const compet_round = "Final";
  const gender = "F";
  const weight = "-49";
  const blue_name = "Name O.";
  const red_name = "Name T.";
  const round_time = 1000; // in second * 100
  const break_time = 500;

  const [time, setTime] = useState(round_time);
  const [isStopped, setIsStopped] = useState(true);
  const [isBreak, setIsBreak] = useState(false);

  const [round, setRound] = useState(1);

  const blueScore = useAppSelector((state) => state.scoreboard.blueScore);
  const blueTech = useAppSelector((state) => state.scoreboard.blueTech);

  const redScore = useAppSelector((state) => state.scoreboard.redScore);
  const redTech = useAppSelector((state) => state.scoreboard.redTech);

  // const [blueScore, setBlueScore] = useState(0);
  // const [blueTech, setBlueTech] = useState([0, 0, 0, 0, 0]);
  // const [redScore, setRedScore] = useState(0);
  // const [redTech, setRedTech] = useState([0, 0, 0, 0, 0]);
  const [blueGamjeom, setBlueGamjeom] = useState(0);
  const [redGamjeom, setRedGamjeom] = useState(0);
  const [blueWinRound, setBlueWinRound] = useState(0);
  const [redWinRound, setRedWinRound] = useState(0);
  const [blueScores, setBlueScores] = useState([0, 0, 0]);
  const [redScores, setRedScores] = useState([0, 0, 0]);

  let blue_hits = 0;
  let red_hits = 0;

  const onKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === " ") {
      setIsStopped(!isStopped);
    }
    if (!isBreak) {
      const keyPointActionMap: { [key: string]: IPointAction } = {
        p: { bluePoint: 1, redPoint: 0, techIndex: 0 },
        "[": { bluePoint: 2, redPoint: 0, techIndex: 1 },
        "]": { bluePoint: 3, redPoint: 0, techIndex: 2 },
        l: { bluePoint: 0, redPoint: 1, techIndex: 0 },
        ";": { bluePoint: 0, redPoint: 2, techIndex: 1 },
        "'": { bluePoint: 0, redPoint: 3, techIndex: 2 },
      };
      const pointAction = keyPointActionMap[e.key];

      if (pointAction) {
        if (pointAction.bluePoint > 0) {
          dispatch(updateScore({ color: 'blue', score: pointAction.bluePoint, isGamjeom: false}))
        }

        if (pointAction.redPoint > 0) {
          dispatch(updateScore({ color: 'red', score: pointAction.redPoint, isGamjeom: false}))
        }
      }
    }
    if (isStopped === true) {
      if (e.key === "s") {
      } else if (e.key === ".") {
        setBlueGamjeom((prevBG) => prevBG + 1);
        dispatch(updateScore({ color: 'red', score: 1, isGamjeom: true}))
      } else if (e.key === "/") {
        setRedGamjeom((prevRG) => prevRG + 1);
        dispatch(updateScore({ color: 'blue', score: 1, isGamjeom: true}))
        // setBlueScore((prevBlueScore) => prevBlueScore + 1);
      }
    }
  };

  useEffect(() => {
    const socket = io(WEBSOCKET_ENDPOINT); 

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    socket.on('update', (data : IControllerData) => {
      if (!isBreak && !isStopped) {
        dispatch(updateScore({ color: data.color, score: data.score, isGamjeom: false}));
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    return () => {
      socket.disconnect();
    };
  }, [isBreak, isStopped, dispatch]);
  

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isStopped && time > 0) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 10);
    } else if (!isBreak && time === 0) {
      setRedScores((prevScores) => {
        const newScores = [...prevScores];
        newScores[round - 1] = redScore;
        return newScores;
      });
      setBlueScores((prevScores) => {
        const newScores = [...prevScores];
        newScores[round - 1] = blueScore;
        return newScores;
      });
      setTime(break_time);
      setIsBreak(true);

      if (redScore > blueScore) {
        setRedWinRound((prev) => prev + 1);
      } else if (blueScore > redScore) {
        setBlueWinRound((prev) => prev + 1);
      } else if (blueScore === redScore) {
        if (blueScore - redGamjeom > redScore - blueGamjeom) {
          setBlueWinRound((prev) => prev + 1);
        } else if (redScore - blueGamjeom > blueScore - redGamjeom) {
          setRedWinRound((prev) => prev + 1);
        }
      }
    } else if (isBreak && time === 0) {
      setRound((prevRound) => prevRound + 1);
      dispatch(resetScore("blue"))
      dispatch(resetScore("red"))
      setBlueGamjeom(0);
      setRedGamjeom(0);
      setTime(round_time);
      setIsBreak(false);
      setIsStopped(true);
    }
    return () => {
      clearInterval(timer);
    };
  }, [isBreak, isStopped, time]);

  const minute = String(Math.floor(time / 6000)).padStart(1, "0");
  const second = String(Math.floor((time % 6000) / 100)).padStart(2, "0");
  const millisecond = String(time % 100).padStart(2, "0");

  return (
    <div className="h-screen flex flex-col" tabIndex={0} onKeyDown={onKeyDown}>
      <div className="bg-black w-full text-white text-2xl text-center p-2">
        {" "}
        {age} - {compet_round} {gender} {weight}KG{" "}
      </div>
      <div className="flex flex-row">
        <div className="basis-1/2 text-center text-3xl text-white p-5 bg-[#17176a]">
          {blue_name}
        </div>
        <div className="basis-1/2 text-center text-3xl text-white p-5 bg-[#7f1917]">
          {red_name}
        </div>
      </div>
      <div className="h-fit flex flex-grow flex-row">
        <div className="basis-[10%] text-center text-white p-5 bg-[#17176a]">
          <ul className="list-none">
            {blueTech.map((tech, index) => (
              <li key={index} className="text-xl my-1">
                {index + 1} point : {tech}
              </li>
            ))}
          </ul>
        </div>
        <div className="basis-[27.5%] bg-[#0000ae] flex items-center justify-center">
          {isBreak ? (
            <div className="flex flex-col">
              <div className="flex flex-row">
                <ul className="list-none basis-1/2 text-white text-6xl font-bold m-5">
                  <li className="my-2">R1</li>
                  <li className="my-2">R2</li>
                  <li className="my-2">R3</li>
                </ul>
                <ul className="list-none basis-1/2 text-white text-6xl font-bold m-5">
                  {round >= 1 && <li className="my-2">{blueScores[0]}</li>}
                  {round >= 2 && <li className="my-2">{blueScores[1]}</li>}
                  {round >= 3 && <li className="my-2">{blueScores[2]}</li>}
                </ul>
              </div>
              <div className="text-center text-white text-[190px] font-black">
                {blueWinRound}
              </div>
            </div>
          ) : (
            <div
              className={`text-center text-white font-black ${
                blueScore >= 200
                  ? "text-[180px]" 
                  : blueScore >= 100
                  ? "text-[200px]"
                  : blueScore >= 20 
                  ? "text-[250px]"
                  : blueScore >= 10
                  ? "text-[300px]"
                  : "text-[350px]"
              }`}
            >
              {blueScore}
            </div>
          )}
        </div>
        <div className="basis-[25%] bg-black">
          <div className="flex flex-col p-5">
            <div className="text-center text-5xl font-semibold text-white mb-5">
              MATCH
            </div>
            <div className="text-center text-7xl font-bold text-white">
              {match_num}
            </div>
          </div>
          {isBreak ? (
            <div className="flex flex-col pb-3 bg-black">
              <div className="text-6xl font-bold text-white text-center">
                Time out
              </div>
              <div className="text-[110px] font-extrabold text-center text-white">
                {minute}:{second}
              </div>
            </div>
          ) : (
            <div
              className={`flex flex-col pb-3 ${
                isStopped ? `bg-[#eeff00]` : `bg-black`
              }`}
            >
              <div
                className={`text-[110px] font-extrabold text-center border-2 border-[#eeff00] ${
                  isStopped ? `text-black` : `text-white`
                }`}
              >
                {parseInt(second, 10) < 10
                  ? `${second}:${millisecond}`
                  : `${minute}:${second}`}
              </div>
              <div className="text-6xl font-bold text-black text-center">
                Time out
              </div>
            </div>
          )}
          <div className="flex flex-col">
            <div className="mt-10 text-center text-5xl font-semibold text-white">
              ROUND
            </div>
          </div>
        </div>
        <div className="basis-[27.5%] bg-[#ad0201] flex items-center justify-center">
          {isBreak ? (
            <div className="flex flex-col">
              <div className="flex flex-row">
                <ul className="list-none basis-1/2 text-white text-6xl font-bold m-5">
                  <li className="my-2">R1</li>
                  <li className="my-2">R2</li>
                  <li className="my-2">R3</li>
                </ul>
                <ul className="list-none basis-1/2 text-white text-6xl font-bold m-5">
                  {round >= 1 && <li className="my-2">{redScores[0]}</li>}
                  {round >= 2 && <li className="my-2">{redScores[1]}</li>}
                  {round >= 3 && <li className="my-2">{redScores[2]}</li>}
                </ul>
              </div>
              <div className="text-center text-white text-[190px] font-black">
                {redWinRound}
              </div>
            </div>
          ) : (
            <div
              className={`text-center text-white font-black ${
                redScore >= 200
                  ? "text-[180px]" 
                  : redScore >= 100
                  ? "text-[200px]"
                  : redScore >= 20 
                  ? "text-[250px]"
                  : redScore >= 10
                  ? "text-[300px]"
                  : "text-[350px]"
              }`}
            >
              {redScore}
            </div>
          )}
        </div>
        <div className="basis-[10%] text-center text-3xl text-white p-5 bg-[#7f1917]">
          <ul className="list-none">
            {redTech.map((tech, index) => (
              <li key={index} className="text-xl my-1">
                {index + 1} point : {tech}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex flex-row">
        <div className="basis-[10%] p-4 bg-[#17176a]">
          <div className="min-w-fit">
            <div className="text-center text-white text-s">GAM-JEOM</div>
            <div className="text-center text-white font-extrabold text-7xl">
              {blueGamjeom}
            </div>
          </div>
        </div>
        <div className="flex flex-row basis-[27.5%] bg-[#17176a]">
          <div className="basis-1/2 flex flex-col min-w-fit p-4">
            <div className="text-center text-green-500 text-s">#WON</div>
            <div className="text-center text-green-500 font-extrabold text-7xl">
              {blueWinRound}
            </div>
          </div>
          <div className="basis-1/2 flex flex-col min-w-fit p-4">
            <div className="text-center text-green-500 text-s">HITS</div>
            <div className="text-center text-green-500 font-extrabold text-7xl">
              {blue_hits}
            </div>
          </div>
        </div>
        <div className="basis-[25%] bg-black">
          <div className="text-center text-white font-extrabold text-8xl">
            {round}
          </div>
        </div>
        <div className="flex flex-row basis-[27.5%] bg-[#7f1917]">
          <div className="basis-1/2 flex flex-col min-w-fit p-4">
            <div className="text-center text-green-500 text-s">HITS</div>
            <div className="text-center text-green-500 font-extrabold text-7xl">
              {red_hits}
            </div>
          </div>
          <div className="basis-1/2 flex flex-col min-w-fit p-4">
            <div className="text-center text-green-500 text-s">WON</div>
            <div className="text-center text-green-500 font-extrabold text-7xl">
              {redWinRound}
            </div>
          </div>
        </div>
        <div className="basis-[10%] p-4 bg-[#7f1917]">
          <div className="min-w-fit">
            <div className="text-center text-white text-s">GAM-JEOM</div>
            <div className="text-center text-white font-extrabold text-7xl">
              {redGamjeom}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
