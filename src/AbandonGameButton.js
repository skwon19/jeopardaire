import './AbandonGameButton.css';

const AbandonGameButton = () => {
    const verifyAbandonGame = () => {
        if (window.confirm("Are you sure you want to abandon this game? You will lose all the game data.")) {
            localStorage.clear();
            window.location.reload();
        }
    }

    return (
        <div className="abandon-game">
            <button className="abandon-game-btn" onClick={verifyAbandonGame}>
                Abandon Game
            </button>
        </div>
    );
}

export default AbandonGameButton;