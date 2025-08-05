import './App.css';
import GridComponent from './GridComponent';
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useParams } from "react-router-dom";

const PageView = () => {
  const { row, col } = useParams();
  return (
    <div className="flex flex-col items-center justify-center h-screen text-2xl">
      <p>You navigated to:</p>
      <p className="font-bold">Row {row}, Column {col}</p>
    </div>
  );
};

function App() {
  const [headers, setHeaders] = useState([]);

  useEffect(() => {
    const fetchData = async() => {
      const response = await fetch("/questions.json");
      const data = await response.json();
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
          <Route path="/page/:row/:col" element={<PageView />} />
        </Routes>
      </div>
    </Router>
  );
}


export default App;
