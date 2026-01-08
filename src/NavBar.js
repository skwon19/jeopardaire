import React from 'react';
import './NavBar.css';

const NavBar = () => {
    return (
        <header className="nav-bar">
            <div className="nav-left">
                {/* <span className="nav-title">Jeopardaire</span> */}
                <a href="/" className="home">
                    <span className="nav-title">Jeopardaire</span>
                </a>
            </div>
            <div className="nav-right">
                <a href="/help" className="help-link" aria-label="Help">
                    <span className="help-icon">?</span>
                </a>
            </div>
        </header>
    );
}

export default NavBar;
