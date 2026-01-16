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
                {players.map((name, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                        <input
                            type="text"
                            value={players.name}
                            onChange={e => handleChange(idx, "name", e.target.value)}
                            placeholder={`Player ${idx + 1}`}
                            required
                        />
                        <input
                            type="text"
                            value={players.penalty}
                            onChange={e => handleChange(idx, "penalty", e.target.value)}
                            placeholder="Penalty action (e.g. Do 10 push-ups)"
                            required
                            style={{ width: "350px" }}
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