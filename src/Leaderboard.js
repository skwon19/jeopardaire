import "./Leaderboard.css";

const Leaderboard = ({ players, scores }) => {
    // Combine names and scores, then sort descending
    const results = players.map((name, idx) => ({
        name,
        score: scores[idx] ?? 0
    })).sort((a, b) => b.score - a.score);

    const playAgain = () => {
        localStorage.clear();
        window.location.reload();
    }

    return (
        <div className="leaderboard">
            <h2>Final Scores</h2>
            {results.map((player, idx) => (
                <div
                    key={player.name}
                    className={
                        "leaderboard-row" +
                        (idx === 0 ? " leaderboard-row--winner" : "")
                    }
                >
                    <span className="leaderboard-name">{player.name}</span>
                    <span className="leaderboard-score">{player.score}</span>
                    {idx === 0 && <span className="leaderboard-winner">WINNER</span>}
                </div>
            ))}
            <button className="play-again-btn" onClick={playAgain}>Play again</button>
        </div>
    );
};

export default Leaderboard;