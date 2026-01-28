import React from 'react';
import './NavBar.css';

const NavBar = ({ view}) => {
    const verifyAbandonGame = () => {
        if (window.confirm("Are you sure you want to abandon this game? You will lose all the game data.")) {
            localStorage.clear();
            window.location.reload();
        }
    }

    const abandonableViews = new Set(["playerEntry", "grid", "question", "audiencePoll"]);

    return (
        <header className="nav-bar">
            <div className="nav-left">
                <a href={process.env.PUBLIC_URL + '/'} className="home">
                    <span className="nav-title">JEOPARDAIRE</span>
                </a>
            </div>
            <div className="nav-right">
                {abandonableViews.has(view) && (
                    <div className="exit-container" onClick={verifyAbandonGame}>
                        <input type="image" className="abandon-game-btn" src={process.env.PUBLIC_URL + "/exit-icon-white.png"} />
                    </div>
                )}

                <a href={process.env.PUBLIC_URL + '/help'} className="help-link" aria-label="Help">
                    <span className="help-icon">?</span>
                </a>
            </div>
        </header>
    );
}

export default NavBar;
