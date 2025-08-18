import React from "react";
import GridComponent from "./GridComponent";
import Scoreboard from "./Scoreboard";

const GridPage = ({ rows, columns, headers, players, scores, currentPlayer }) => {
    return (
        <div className="grid-page">
            <GridComponent rows={rows} columns={columns} headers={headers} />
            <Scoreboard players={players} scores={scores} currentPlayer={currentPlayer} />
        </div>
    );
};

export default GridPage;