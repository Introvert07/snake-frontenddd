import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Timer, User, Skull, Zap, ChevronRight, Dice5, ShieldAlert, LogOut } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const HUDDLES = [8, 12, 19, 25, 33, 38, 47, 50, 55, 62, 70, 75, 82, 88, 92, 95, 98];
// Replace the hardcoded line with this:
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
export default function App() {
  // PERSISTENCE: Initialize state from localStorage if available
  const [user, setUser] = useState(() => localStorage.getItem('pq_user') || "");
  const [pos, setPos] = useState(() => Number(localStorage.getItem('pq_pos')) || 1);
  const [timer, setTimer] = useState(() => Number(localStorage.getItem('pq_timer')) || 0);
  const [startTime, setStartTime] = useState(() => Number(localStorage.getItem('pq_start')) || null);
  
  const [challenge, setChallenge] = useState(null);
  const [ans, setAns] = useState("");
  const [isGameOver, setIsGameOver] = useState(false);
  const [lastRoll, setLastRoll] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  const [tempName, setTempName] = useState(""); // For the login input

  // Save progress to localStorage whenever key values change
  useEffect(() => {
    if (user) {
      localStorage.setItem('pq_user', user);
      localStorage.setItem('pq_pos', pos);
      localStorage.setItem('pq_timer', timer);
      if (startTime) localStorage.setItem('pq_start', startTime);
    }
  }, [user, pos, timer, startTime]);

  useEffect(() => {
    let interval;
    if (startTime && !isGameOver) {
      interval = setInterval(() => {
        setTimer(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, isGameOver]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (tempName.trim()) {
      setUser(tempName.trim());
      setStartTime(Date.now());
      toast.success(`Welcome, ${tempName}! System Online.`);
    }
  };

  const logout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const rollDice = async () => {
    setIsRolling(true);
    setTimeout(async () => {
      const roll = Math.floor(Math.random() * 6) + 1;
      setLastRoll(roll);
      setIsRolling(false);
      
      let nextPos = pos + roll;
      if (nextPos >= 100) {
        finishGame();
      } else if (HUDDLES.includes(nextPos)) {
        try {
          const res = await axios.get(`${BASE_URL}/question`);
          setChallenge({ ...res.data, next: nextPos });
          toast('⚠️ SNAKE ENCOUNTER!', { icon: '🐍', style: { background: '#1e293b', color: '#fff' } });
        } catch (e) {
          setPos(nextPos);
        }
      } else {
        setPos(nextPos);
      }
    }, 600);
  };

  const submitAnswer = () => {
    if (ans.toLowerCase().trim() === challenge.answer.toLowerCase().trim()) {
      setPos(challenge.next);
      toast.success("CONGRATS! Bypass successful.", { duration: 3000 });
      setChallenge(null);
      setAns("");
    } else {
      setPos(1); 
      toast.error("BITTEN! Resetting to start point.", { duration: 5000, icon: '🐍' });
      setChallenge(null);
      setAns("");
    }
  };

  const finishGame = async () => {
    setPos(100);
    setIsGameOver(true);
    try {
      await axios.post(`${BASE_URL}/save-score`, { username: user, timeTaken: timer });
      toast.success("QUEST COMPLETE!", { icon: '🏆', duration: 10000 });
      localStorage.clear(); // Clear storage on win so they can start fresh
    } catch (e) { console.error("Score not saved"); }
  };

  const renderBoard = () => {
    const board = [];
    for (let row = 9; row >= 0; row--) {
      const cols = [];
      for (let col = 0; col < 10; col++) {
        const num = row % 2 === 0 ? row * 10 + (col + 1) : row * 10 + (10 - col);
        cols.push(num);
      }
      board.push(cols);
    }
    return board;
  };

  // 1. IMPROVED LOGIN PAGE
  if (!user) return (
    <div className="h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
      <Toaster position="top-center" />
      <div className="text-center mb-10">
        <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 animate-pulse">
          PYTHON QUEST
        </h1>
        <p className="text-slate-500 font-mono mt-4 tracking-[0.3em] text-xs uppercase">Decipher. Survive. Conquer.</p>
      </div>

      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        <div className="relative group">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-yellow-500 transition-colors" size={20} />
          <input 
            type="text"
            required
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            placeholder="ENTER_USERNAME"
            className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl py-5 pl-12 pr-4 text-white font-bold outline-none focus:border-yellow-500 transition-all placeholder:text-slate-700"
          />
        </div>
        <button type="submit" className="w-full py-5 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xl rounded-2xl shadow-lg shadow-yellow-500/10 transition-all hover:-translate-y-1 active:translate-y-0">
          INITIALIZE_SYSTEM
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white font-mono flex flex-col items-center py-6 px-4 overflow-x-hidden">
      <Toaster position="top-right" />
      
      {/* 2. PERSISTENT HUD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 w-full max-w-5xl mb-6">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
          <User className="text-blue-500" size={18} />
          <span className="text-sm font-bold truncate flex-1">{user}</span>
          <button onClick={logout} title="Logout"><LogOut size={16} className="text-slate-600 hover:text-red-500" /></button>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
          <Timer className="text-green-500" size={18} />
          <span className="text-sm font-bold">{timer}s elapsed</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
          <Zap className="text-yellow-500" size={18} />
          <span className="text-sm font-bold">PROGRESS: {pos}%</span>
        </div>
        <div className="hidden md:flex bg-slate-900 border border-slate-800 p-3 rounded-xl items-center justify-center">
          <span className="text-[10px] text-slate-500">AUTO_SAVE: ENABLED</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start w-full justify-center max-w-7xl">
        {/* Responsive Board */}
        <div className="bg-slate-900 p-2 md:p-4 rounded-3xl border-4 border-slate-800 shadow-2xl mx-auto">
          {renderBoard().map((row, i) => (
            <div key={i} className="flex">
              {row.map(num => (
                <div key={num} className={`
                  w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 
                  border border-slate-800/40 flex items-center justify-center relative
                  ${HUDDLES.includes(num) ? 'bg-red-950/20' : 'bg-slate-900/30'}
                  ${pos === num ? 'bg-blue-500/20' : ''}
                `}>
                  <span className="absolute top-0.5 left-0.5 text-[6px] md:text-[8px] opacity-20">{num}</span>
                  {HUDDLES.includes(num) && <Skull className="text-red-600/20" size={14} />}
                  {pos === num && (
                    <div className="relative z-10 w-6 h-6 md:w-9 md:h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.6)] animate-bounce border-2 border-blue-400">
                      <User size={16} className="text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* 3. IMPROVED SIDEBAR CONTROLS */}
        <div className="flex flex-col gap-4 w-full lg:w-72">
          <div className="bg-slate-900 border-2 border-slate-800 p-8 rounded-3xl flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
            <div className="absolute top-2 left-2 text-[8px] text-slate-700">DICE_MODULE_V2</div>
            <Dice5 size={48} className={isRolling ? "animate-spin text-slate-700" : "text-yellow-500"} />
            {!isRolling && <span className="text-3xl font-black mt-2">{lastRoll || "?"}</span>}
          </div>
          
          <button 
            onClick={rollDice} 
            disabled={challenge || isGameOver || isRolling} 
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 py-6 rounded-2xl font-black text-xl transition-all shadow-xl active:scale-95 disabled:opacity-50"
          >
            {isRolling ? "ROLLING..." : "EXECUTE_ROLL"}
          </button>

          {isGameOver && (
             <div className="p-4 bg-green-500/20 border border-green-500 rounded-2xl text-center">
                <Trophy className="mx-auto mb-2 text-green-500" />
                <p className="text-xs font-bold uppercase">Mission Successful</p>
                <button onClick={logout} className="mt-3 text-[10px] underline">START_NEW_SESSION</button>
             </div>
          )}
        </div>
      </div>

      {/* Challenge Modal */}
      {challenge && (
        <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <div className="bg-slate-900 border-2 border-red-600 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-red-600 p-4 flex items-center gap-3">
              <ShieldAlert className="text-white" size={24} />
              <h2 className="font-black italic text-lg tracking-tight">SNAKE_INTRUSION_DETECTED</h2>
            </div>
            
            <div className="p-6">
              <div className="bg-black p-5 rounded-xl border border-slate-800 mb-6">
                <p className="text-slate-500 text-[10px] mb-3 font-sans uppercase tracking-widest">Target Code Snippet:</p>
                <pre className="text-green-400 whitespace-pre-wrap text-sm leading-relaxed font-mono">
                  {challenge.text}
                </pre>
              </div>

              <input 
                className="w-full p-5 bg-slate-950 border-2 border-slate-800 rounded-2xl mb-4 text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-800"
                value={ans} 
                onChange={e => setAns(e.target.value)} 
                placeholder="INPUT_RESPONSE" 
                autoFocus 
                onKeyPress={(e) => e.key === 'Enter' && submitAnswer()}
              />
              
              <button onClick={submitAnswer} className="w-full bg-white text-black py-5 rounded-2xl font-black text-lg hover:bg-yellow-400 transition-colors">
                SUBMIT_PATCH
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}