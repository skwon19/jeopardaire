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

  const scores = Array(players.length).fill(0); // Initialize scores for each player
  let currentPlayer = 0;

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

  return (
    <Router>
      <div>
        <h1>Jeopardaire</h1>
        <Routes>
          <Route path="/" element={<PlayerEntryPage onPlayersSet={setPlayers} />} />
          <Route path="/grid" element={<GridPage rows={6} columns={4} headers={headers} 
            players={players} scores={scores} currentPlayer={currentPlayer} />} />
          <Route path="/page/:row/:col" element={<QuestionPage questions={questions} />} />
        </Routes>
      </div>
    </Router>
  );
}


export default App;
