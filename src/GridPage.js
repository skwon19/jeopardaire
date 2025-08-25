import React from "react";
import { useNavigate } from "react-router-dom";
import GridComponent from "./GridComponent";
import Scoreboard from "./Scoreboard";

const GridPage = ({ 
    rows, 
    columns, 
    headers, 
    players, 
    scores, 
    currentPlayer,
    setPlayers
}) => {
    const navigate = useNavigate();
    
    // Button to clear game, for debugging
    const clearGame = () => {
        setPlayers([]);
        navigate("/");
    }
    
    return (
        <div className="grid-page">
            <GridComponent rows={rows} columns={columns} headers={headers} />
            <Scoreboard players={players} scores={scores} currentPlayer={currentPlayer} />
            <button type="button" onClick={clearGame}>New Game</button>
        </div>
    );
};

export default GridPage;