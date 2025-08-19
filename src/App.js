import './App.css';
import GridComponent from './GridComponent';
import GridPage from './GridPage';
import PlayerEntryPage from './PlayerEntryPage';
import QuestionPage from './QuestionPage';
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useParams } from "react-router-dom";

function App() {
  const [headers, setHeaders] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [players, setPlayers] = useState([]);
  const [scores, setScores] = useState(Array(players.length).fill(0));
  const [currentPlayer, setCurrentPlayer] = useState(0);

  // const scores = Array(players.length).fill(0); // Initialize scores for each player
  // let currentPlayer = 0;

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

  // Reset scores when players change
  useEffect(() => {
    setScores(Array(players.length).fill(0));
    setCurrentPlayer(0);
  }, [players]);

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
