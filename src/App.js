import './App.css';
import GridPage from './GridPage';
import PlayerEntryPage from './PlayerEntryPage';
import QuestionPage from './QuestionPage';
import React, { use, useEffect, useState } from "react";

function App() {
  const [headers, setHeaders] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem("players");
    return saved ? JSON.parse(saved) : [];
  });
  const [scores, setScores] = useState(() => {
    const saved = localStorage.getItem("scores");
    return saved ? JSON.parse(saved) : Array(players.length).fill(0);
  });
  const [currentPlayer, setCurrentPlayer] = useState(() => {
    const saved = localStorage.getItem("currentPlayer");
    return saved ? JSON.parse(saved) : 0;
  });

  const [view, setView] = useState("entry"); // "entry", "grid", "question"
  const [questionCoords, setQuestionCoords] = useState({ row: null, col: null });

  useEffect(() => {
    const fetchData = async() => {
      const response = await fetch("/questions.json");
      const data = await response.json();
      setQuestions(data);
      const categoryNames = data.map(item => item.category);
      setHeaders(categoryNames);
    };
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem("players", JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem("scores", JSON.stringify(scores));
  }, [scores]);

  useEffect(() => {
    localStorage.setItem("currentPlayer", JSON.stringify(currentPlayer));
  }, [currentPlayer]);

  // Decide which view to show based on state
  useEffect(() => {
    if (players.length === 0) {
      setView("entry");
    } else if (questionCoords.row !== null && questionCoords.col !== null) {
      setView("question");
    } else {
      setView("grid");
    }
  }, [players, questionCoords]);

  // Handlers to switch views
  const handleQuestionSelect = (row, col) => {
    setQuestionCoords({ row, col });
    setView("question");
  };

  const handleQuestionClose = () => {
    const nextPlayer = (currentPlayer + 1) % players.length;
    setCurrentPlayer(nextPlayer);
    setQuestionCoords({ row: null, col: null });
    setView("grid");
  };

  // Clear game, for debugging
  const clearGame = () => {
    setPlayers([]);
    setScores([]);
    setCurrentPlayer(0);
  }

  const initializePlayers = (players) => {
    setPlayers(players);
    setScores(Array(players.length).fill(0));
    setCurrentPlayer(0);
  }

  return (
    <div>
      <h1>Jeopardaire</h1>
      {view === "entry" && (
        <PlayerEntryPage initializePlayers={initializePlayers} />
      )}
      {view === "grid" && (
        <GridPage
          rows={6}
          columns={headers.length}
          headers={headers}
          players={players}
          scores={scores}
          currentPlayer={currentPlayer}
          onQuestionSelect={handleQuestionSelect}
          clearGame={clearGame}
        />
      )}
      {view === "question" && (
        <QuestionPage
          questions={questions}
          scores={scores}
          setScores={setScores}
          currentPlayer={currentPlayer}
          players={players}
          row={questionCoords.row}
          col={questionCoords.col}
          onClose={handleQuestionClose}
        />
      )}
    </div>
  );
}


export default App;
