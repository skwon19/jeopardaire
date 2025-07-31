import logo from './logo.svg';
import './App.css';
import GridComponent from './GridComponent';
import React from "react";
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
  return (
    // <div className="App">
    //   <header className="App-header">
    //     <img src={logo} className="App-logo" alt="logo" />
    //     <p>
    //       Edit <code>src/App.js</code> and save to reload.
    //     </p>
    //     <a
    //       className="App-link"
    //       href="https://reactjs.org"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       Learn React
    //     </a>
    //   </header>
    // </div>
    <div>
      <h1>Jeopardaire</h1>
      <GridComponent rows={5} columns={4} />
    </div>
  );
}


export default App;
