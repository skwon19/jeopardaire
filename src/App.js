import './App.css';
import GridComponent from './GridComponent';
import QuestionPage from './QuestionPage';
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useParams } from "react-router-dom";

function App() {
  const [headers, setHeaders] = useState([]);
  const [questions, setQuestions] = useState([]);

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
          <Route path="/" element={<GridComponent rows={6} columns={4} headers={headers} />} />
          <Route path="/page/:row/:col" element={<QuestionPage questions={questions} />} />
        </Routes>
      </div>
    </Router>
  );
}


export default App;
