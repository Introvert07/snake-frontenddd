import React, { useState, useEffect } from 'react';
import { getRandomQuestion, saveUserScore } from './api'; 
import { Trophy, Timer, User, Skull, Zap, Dice5, ShieldAlert, LogOut, Trees, Leaf, Bug } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const HUDDLES = [8, 12, 15, 19, 25, 33, 38, 44, 47, 50, 55, 62, 70, 75, 78, 82, 88, 92, 95, 98];

export default function App() {
  const [user, setUser] = useState(() => localStorage.getItem('pq_user') || "");
  const [pos, setPos] = useState(() => Number(localStorage.getItem('pq_pos')) || 1);
  const [timer, setTimer] = useState(() => Number(localStorage.getItem('pq_timer')) || 0);
  const [startTime, setStartTime] = useState(() => Number(localStorage.getItem('pq_start')) || null);
  
  const [challenge, setChallenge] = useState(null);
  const [ans, setAns] = useState("");
  const [isGameOver, setIsGameOver] = useState(false);
  const [lastRoll, setLastRoll] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  const [tempName, setTempName] = useState("");

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
      toast.success(`Welcome to the Wild, ${tempName}!`);
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
          const data = await getRandomQuestion();
          setChallenge({ ...data, next: nextPos });
          toast('🐍 SNAKE ATTACK!', { 
            style: { background: '#064e3b', color: '#fff', border: '2px solid #fbbf24' } 
          });
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
      toast.success("Snake charmed! Moving forward.");
      setChallenge(null);
      setAns("");
    } else {
      setPos(1); 
      toast.error("Bitten! Back to the start!", { icon: '🐍' });
      setChallenge(null);
      setAns("");
    }
  };

  const finishGame = async () => {
    setPos(100);
    setIsGameOver(true);
    try {
      await saveUserScore({ username: user, timeTaken: timer });
      toast.success("JUNGLE CONQUERED!", { icon: '👑' });
      localStorage.clear();
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

  if (!user) return (
    <div className="min-h-screen bg-[#022c22] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-20 -left-20 text-emerald-900/10 rotate-45"><Trees size={300} /></div>
      <Toaster position="top-center" />
      
      <div className="text-center mb-8 z-10">
        <h1 className="text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-emerald-400 to-yellow-600 drop-shadow-xl">
          PYTHON QUEST
        </h1>
        <p className="text-emerald-500 font-mono mt-2 tracking-widest text-xs uppercase">The Slithering Code</p>
      </div>

      <form onSubmit={handleLogin} className="w-full max-w-xs md:max-w-sm space-y-4 z-10">
        <div className="relative group">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-700" size={20} />
          <input 
            type="text"
            required
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            placeholder="EXPLORER NAME"
            className="w-full bg-[#064e3b] border-4 border-[#166534] rounded-tr-3xl rounded-bl-3xl py-4 pl-12 pr-4 text-white font-bold outline-none focus:border-yellow-500 placeholder:text-emerald-800"
          />
        </div>
        <button type="submit" className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-[#022c22] font-black text-xl rounded-tr-3xl rounded-bl-3xl shadow-lg transform active:scale-95 transition-all">
          START EXPEDITION
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#052c22] text-emerald-50 font-mono flex flex-col items-center pb-24 md:pb-6 pt-4 px-2 md:px-4">
      <Toaster position="top-right" />
      
      {/* Responsive Stats Bar */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-4xl mb-4 text-[10px] md:text-sm">
        <div className="bg-[#064e3b] border-b-4 border-[#166534] p-2 rounded-xl flex items-center justify-between overflow-hidden">
          <div className="flex items-center gap-1 md:gap-2 truncate">
            <User size={14} className="text-yellow-500 flex-shrink-0" />
            <span className="truncate font-bold">{user}</span>
          </div>
          <button onClick={logout} className="ml-1 text-red-400"><LogOut size={14} /></button>
        </div>
        <div className="bg-[#064e3b] border-b-4 border-[#166534] p-2 rounded-xl flex items-center gap-1 md:gap-2 justify-center">
          <Timer size={14} className="text-emerald-400 flex-shrink-0" />
          <span className="font-bold">{timer}s</span>
        </div>
        <div className="bg-[#064e3b] border-b-4 border-[#166534] p-2 rounded-xl flex items-center gap-1 md:gap-2 justify-center">
          <Leaf size={14} className="text-green-500 flex-shrink-0" />
          <span className="font-bold">{pos}%</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 md:gap-8 items-center w-full max-w-6xl justify-center">
        
        {/* Game Board Container */}
        <div className="w-full max-w-[500px] lg:max-w-none lg:w-auto bg-[#3f2b1d] p-2 md:p-4 rounded-2xl shadow-2xl border-4 border-[#2d1e14]">
          <div className="bg-[#064e3b] p-0.5 md:p-1 rounded-lg border-2 border-[#166534]">
            {renderBoard().map((row, i) => (
              <div key={i} className="flex">
                {row.map(num => (
                  <div key={num} className={`
                    w-[10vw] h-[10vw] max-w-[48px] max-h-[48px] md:w-12 md:h-12 lg:w-14 lg:h-14 
                    border border-emerald-900/30 flex items-center justify-center relative overflow-hidden
                    ${HUDDLES.includes(num) ? 'bg-red-900/20' : num % 2 === 0 ? 'bg-emerald-800/10' : 'bg-emerald-700/10'}
                  `}>
                    <span className="absolute top-0.5 left-0.5 text-[6px] md:text-[8px] text-emerald-500/40">{num}</span>
                    {HUDDLES.includes(num) && <Bug className="text-red-500/30" size={12} />}
                    {pos === num && (
                      <div className="relative z-10 w-4/5 h-4/5 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg  border-2 border-white">
                        <span className="text-[12px] md:text-lg">🐍</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Controls - Sticky on Mobile Bottom */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#052c22]/90 backdrop-blur-sm lg:relative lg:bg-transparent lg:p-0 flex lg:flex-col gap-4 w-full lg:w-64 z-50">
          <div className="hidden lg:flex bg-[#064e3b] border-4 border-[#166534] p-6 rounded-tr-[3rem] rounded-bl-[3rem] flex-col items-center justify-center shadow-xl">
            <Dice5 size={40} className={isRolling ? "animate-spin text-emerald-800" : "text-yellow-500"} />
            {!isRolling && <span className="text-3xl font-black mt-2 text-yellow-500">{lastRoll || "?"}</span>}
          </div>
          
          <button 
            onClick={rollDice} 
            disabled={challenge || isGameOver || isRolling} 
            className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-[#022c22] border-b-4 border-yellow-700 py-4 lg:py-6 rounded-xl lg:rounded-tr-3xl lg:rounded-bl-3xl font-black text-lg md:text-xl transition-all active:border-b-0 active:translate-y-1 disabled:opacity-50"
          >
            {isRolling ? "ROLLING..." : `ROLL DICE ${lastRoll ? `(${lastRoll})` : ""}`}
          </button>
        </div>
      </div>

      {/* Challenge Overlay - Improved Mobile Scroll */}
      {challenge && (
        <div className="fixed inset-0 bg-emerald-950/98 flex items-center justify-center p-2 md:p-4 z-[100] overflow-y-auto">
          <div className="bg-[#064e3b] border-4 border-red-600 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl my-auto">
            <div className="bg-red-600 p-3 md:p-4 flex items-center gap-3">
              <ShieldAlert className="text-white" size={20} />
              <h2 className="font-black italic text-sm md:text-lg text-white">SNAKE ENCOUNTER!</h2>
            </div>
            
            <div className="p-4 md:p-6">
              <div className="bg-[#022c22] p-3 md:p-5 rounded-xl border-2 border-[#166534] mb-4 overflow-x-auto">
                <pre className="text-emerald-300 text-xs md:text-sm leading-relaxed font-mono">
                  {challenge.text}
                </pre>
              </div>

              <input 
                className="w-full p-4 bg-[#022c22] border-2 border-[#166534] rounded-xl mb-4 text-white focus:border-yellow-500 outline-none text-sm"
                value={ans} 
                onChange={e => setAns(e.target.value)} 
                placeholder="Enter Answer..." 
                autoFocus 
                onKeyPress={(e) => e.key === 'Enter' && submitAnswer()}
              />
              
              <button onClick={submitAnswer} className="w-full bg-emerald-100 text-[#022c22] py-4 rounded-xl font-black text-sm md:text-lg hover:bg-white transition-colors">
                SUBMIT SOLUTION
              </button>
            </div>
          </div>
        </div>
      )}

      {isGameOver && (
        <div className="fixed inset-0 bg-[#022c22]/90 flex items-center justify-center z-[110] p-4">
          <div className="bg-yellow-500 p-8 rounded-3xl text-center max-w-xs border-b-8 border-yellow-700">
            <Trophy className="mx-auto mb-4 text-[#022c22]" size={64} />
            <h2 className="text-2xl font-black text-[#022c22] mb-2">VICTORY!</h2>
            <p className="text-[#022c22]/80 font-bold mb-6 text-sm">You survived the Python Forest.</p>
            <button onClick={logout} className="w-full bg-[#022c22] text-white py-3 rounded-xl font-bold">PLAY AGAIN</button>
          </div>
        </div>
      )}
    </div>
  );
}