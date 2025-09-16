import "./Scoreboard.css";

const Scoreboard = ({ players, scores, currentPlayer }) => {
    return (
        <div className="scoreboard">
            {players.map((player, idx) => (
                <div 
                    key={idx} 
                    className={"scoreboard-cell" + 
                        (idx === currentPlayer ? " scoreboard-cell--active": "")}
                >
                    <div className="scoreboard-name">{player}</div>
                    <div className="scoreboard-score">{scores[idx] ?? 0}</div>
                </div>
            ))}
        </div>
    );
}

export default Scoreboard;