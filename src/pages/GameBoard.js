import React, { useEffect, useState } from 'react';
import { socket } from '../socket';

const GameBoard = () => {
    const [players, setPlayers] = useState({});
    const [grid] = useState(Array.from({ length: 100 }, (_, i) => i));

    useEffect(() => {
        socket.on('game_state', (data) => setPlayers(data));
        socket.on('huddle_challenge', ({ question, newPos }) => {
            const ans = prompt(`${question.text}\n1. ${question.options[0]}\n2. ${question.options[1]}`);
            const isCorrect = parseInt(ans) === (question.correctAnswer + 1);
            socket.emit('answer_huddle', { isCorrect, newPos });
        });
    }, []);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 50px)' }}>
            {grid.map(cell => (
                <div key={cell} style={{ width: 50, height: 50, border: '1px solid #ccc', position: 'relative' }}>
                    {cell === 99 ? "WIN" : cell}
                    {Object.values(players).map(p => p.position === cell && (
                        <div style={{ background: 'red', borderRadius: '50%', width: 20, height: 20 }}>{p.username[0]}</div>
                    ))}
                </div>
            ))}
            <button onClick={() => socket.emit('roll_dice')}>Roll Dice</button>
        </div>
    );
};