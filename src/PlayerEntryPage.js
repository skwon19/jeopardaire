import { useState } from "react";
import './PlayerEntryPage.css'

const PlayerEntryPage = ({ initializePlayers }) => {
    const [players, setPlayers] = useState([ // Start with 2 players
        { name: "", penalty: "" },
        { name: "", penalty: "" }
    ]);
    const [error, setError] = useState("");

    function shuffle(array) {
        let currentIndex = array.length;

        // While there remain elements to shuffle...
        while (currentIndex > 0) {

            // Pick a remaining element...
            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
    }

    const handleChange = (idx, field, value) => {
        const updated = [...players];
        updated[idx][field] = value;
        setPlayers(updated);
    };

    const removePlayer = (idx) => {
        const updated = players.filter((_, i) => i !== idx);
        if (updated.length < 2) { // Must have at least 2 players
            updated.push({ name: "", penalty: "" });
        }
        setPlayers(updated);
    };

    const addPlayer = () => setPlayers([...players, { name: "", penalty: "" }]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const filtered = players
            .map(p => ({
                name: p.name.trim(),
                penalty: p.penalty.trim()
            }))
            .filter(Boolean);

        // Check for distinct names
        const names = filtered.map(p => p.name);
        const uniqueNames = new Set(names);
        if (uniqueNames.size !== names.length) {
            setError("Player names must be distinct.");
            return;
        }

        if (filtered.length < 1) {
            setError("Please enter at least one player name.");
            return;
        }
        setError("");
        shuffle(filtered);
        initializePlayers(filtered);
    };

    return (
        <div className="player-entry-page">
            <h2>Enter Player Names and Penalty Actions</h2>
            <form onSubmit={handleSubmit}>
                {players.map((p, idx) => (
                    <div key={idx} className="player-row">
                        <div className="player-row-inputs">
                            <input
                                type="text"
                                className="player-name-input"
                                value={p.name}
                                onChange={e => handleChange(idx, "name", e.target.value)}
                                placeholder={`Player ${idx + 1}`}
                                required
                            />
                            <input
                                type="text"
                                className="player-penalty-input"
                                value={p.penalty}
                                onChange={e => handleChange(idx, "penalty", e.target.value)}
                                placeholder="Penalty action (e.g. Do 10 push-ups)"
                                required
                            />
                        </div>
                        <button type="button" className="remove-player-btn" onClick={() => removePlayer(idx)} aria-label={`Remove player ${idx+1}`}>
                            <img src={process.env.PUBLIC_URL + "/trash-icon.png"} alt="Remove" />
                        </button>
                    </div>
                ))}

                <div className="player-entry-actions">
                    <button type="button" className="add-player-btn" onClick={addPlayer} aria-label="Add player">+</button>
                </div>

                <div className="player-entry-actions">
                    <button type="submit" className="start-game-btn">Start Game</button>
                </div>

                {error && <div className="error">{error}</div>}
            </form>
        </div>
    );
};

export default PlayerEntryPage;