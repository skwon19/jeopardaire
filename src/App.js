import './App.css';
import GridComponent from './GridComponent';
import GridPage from './GridPage';
import PlayerEntryPage from './PlayerEntryPage';
import QuestionPage from './QuestionPage';
import React, { use, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useParams } from "react-router-dom";

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
    setScores(Array(players.length).fill(0));
    setCurrentPlayer(0);
  }, [players]);

  useEffect(() => {
    localStorage.setItem("scores", JSON.stringify(scores));
  }, [scores]);

  useEffect(() => {
    localStorage.setItem("currentPlayer", JSON.stringify(currentPlayer));
  }, [currentPlayer]);

  return (
    <Router>
      <div>
        <h1>Jeopardaire</h1>
        <Routes>
          <Route path="/" element={<PlayerEntryPage onPlayersSet={setPlayers} />} />
          <Route path="/grid" element={
            <GridPage 
              rows={6} 
              columns={headers.length} 
              headers={headers} 
              players={players} 
              scores={scores} 
              currentPlayer={currentPlayer}
              setPlayers={setPlayers}
            />
          } />
          <Route path="/question/:row/:col" element={
            <QuestionPage 
              questions={questions}
              scores={scores}
              setScores={setScores}
              currentPlayer={currentPlayer}
              setCurrentPlayer={setCurrentPlayer}
              players={players}
            />
          } />
        </Routes>
      </div>
    </Router>
  );
}


export default App;
