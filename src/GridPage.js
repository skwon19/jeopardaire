import React from "react";
import GridComponent from "./GridComponent";
import Scoreboard from "./Scoreboard";

const GridPage = ({ 
    rows, 
    columns, 
    headers, 
    players, 
    scores, 
    currentPlayer,
    onQuestionSelect, 
    clearGame
}) => {
    return (
        <div className="grid-page">
            <GridComponent 
                rows={rows} 
                columns={columns} 
                headers={headers}
                onQuestionSelect={onQuestionSelect}
            />
            <Scoreboard players={players} scores={scores} currentPlayer={currentPlayer} />
            <button type="button" onClick={clearGame}>New Game</button>
        </div>
    );
};

export default GridPage;