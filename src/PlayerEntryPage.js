import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const PlayerEntryPage = ({ onPlayersSet }) => {
    const [players, setPlayers] = useState(["", ""]); // Start with 2 players
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (idx, value) => {
        const updated = [...players];
        updated[idx] = value;
        setPlayers(updated);
    };

    const addPlayer = () => setPlayers([...players, ""]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const filtered = players.map(p => p.trim()).filter(Boolean);
        if (filtered.length < 1) {
            setError("Please enter at least one player name.");
            return;
        }
        setError("");
        onPlayersSet(filtered);
        navigate("/grid");
    };

    return (
        <div className="player-entry-page">
            <h2>Enter Player Names</h2>
            <form onSubmit={handleSubmit}>
                {players.map((name, idx) => (
                    <div key={idx}>
                        <input
                            type="text"
                            value={name}
                            onChange={e => handleChange(idx, e.target.value)}
                            placeholder={`Player ${idx + 1}`}
                            required
                        />
                    </div>
                ))}
                <button type="button" onClick={addPlayer}>Add Player</button>
                <button type="submit">Start Game</button>
                {error && <div className="error">{error}</div>}
            </form>
        </div>
    );
};

export default PlayerEntryPage;