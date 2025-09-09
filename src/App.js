import './App.css';
import GridPage from './GridPage';
import PlayerEntryPage from './PlayerEntryPage';
import QuestionPage from './QuestionPage';
import React, { use, useEffect, useState } from "react";

function App() {

  const numPointVals = 5; // points: 100 to 500

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
  const [seenQuestions, setSeenQuestions] = useState(() => {
    const saved = localStorage.getItem("seenQuestions");
    return saved ? JSON.parse(saved) : [];
  });

  const [view, setView] = useState(() => {
    const saved = localStorage.getItem("view");
    return saved ? JSON.parse(saved) : "entry"; // "entry", "grid", "question"
  });

  const [questionCoords, setQuestionCoords] = useState(() => {
    const saved = localStorage.getItem("questionCoords");
    return saved ? JSON.parse(saved) : { row: null, col: null };
  });

  const [selectedAnswers, setSelectedAnswers] = useState(() => { // selected answer index for each question
      const saved = localStorage.getItem("selectedAnswers");
      return saved ? JSON.parse(saved) : [];
  });
  const [feedbacks, setFeedbacks] = useState(() => { // feedbacks for each question
      const saved = localStorage.getItem("feedbacks");
      return saved ? JSON.parse(saved) : [];
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

  useEffect(() => { // After questions load, populate seenQuestions, selectAnswer, feedbacks if empty
    if (headers.length > 0) {
      if (seenQuestions.length === 0) {
        // seenQuestions[row-1][col] gives whether question at (row, col) has been seen (row 0 is headers)
        const defaultSeen = Array.from({ length: numPointVals }, () => new Array(headers.length).fill(false));
        setSeenQuestions(defaultSeen);
      }
      if (selectedAnswers.length === 0) {
        // selectedAnswers[row-1][col] gives selected answer index for question at (row, col) if answered
        const defaultSelected = Array.from({ length: numPointVals }, () => new Array(headers.length).fill(null));
        setSelectedAnswers(defaultSelected);
      }
      if (feedbacks.length === 0) {
        // feedbacks[row-1][col] gives correctness feedback for question at (row, col) if answered
        const defaultFeedbacks = Array.from({ length: numPointVals }, () => new Array(headers.length).fill(""));
        setFeedbacks(defaultFeedbacks);
      }
    }

  }, [headers]);

  useEffect(() => {
    localStorage.setItem("players", JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem("scores", JSON.stringify(scores));
  }, [scores]);

  useEffect(() => {
    localStorage.setItem("currentPlayer", JSON.stringify(currentPlayer));
  }, [currentPlayer]);
  
  useEffect(() => {
    localStorage.setItem("seenQuestions", JSON.stringify(seenQuestions));
  }, [seenQuestions]);

  useEffect(() => {
    localStorage.setItem("view", JSON.stringify(view));
  }, [view]);

  useEffect(() => {
    localStorage.setItem("questionCoords", JSON.stringify(questionCoords));
  }, [questionCoords]);

  useEffect(() => {
      localStorage.setItem("selectedAnswers", JSON.stringify(selectedAnswers));
  }, [selectedAnswers]);

  useEffect(() => {
      localStorage.setItem("feedbacks", JSON.stringify(feedbacks));
  }, [feedbacks]);

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
    const alreadySeen = seenQuestions[row - 1][col] // row 0 is headers
    if (alreadySeen) return;
    setQuestionCoords({ row, col });
    setView("question");
  };

  const handleQuestionClose = () => {
    // Mark this question seen
    if (questionCoords.row !== null && questionCoords.col !== null) {
      const updatedSeen = seenQuestions.map(row => [...row]);
      updatedSeen[questionCoords.row - 1][questionCoords.col] = true; // row 0 is headers
      setSeenQuestions(updatedSeen);
    }
    const nextPlayer = (currentPlayer + 1) % players.length;
    setCurrentPlayer(nextPlayer);
    setQuestionCoords({ row: null, col: null });

    setView("grid");
  };

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
          rows={numPointVals + 1}
          columns={headers.length}
          headers={headers}
          players={players}
          scores={scores}
          currentPlayer={currentPlayer}
          onQuestionSelect={handleQuestionSelect}
          seenQuestions={seenQuestions}
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
          selectedAnswers={selectedAnswers}
          setSelectedAnswers={setSelectedAnswers}
          feedbacks={feedbacks}
          setFeedbacks={setFeedbacks}
        />
      )}
    </div>
  );
}


export default App;
