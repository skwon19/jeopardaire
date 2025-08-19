import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './QuestionPage.css';
import Scoreboard from "./Scoreboard";

const QuestionPage = ({ 
    questions, 
    scores, 
    setScores, 
    currentPlayer, 
    setCurrentPlayer, 
    players 
}) => {
    const { row, col } = useParams();
    const navigate = useNavigate();
    // Convert row and col to numbers
    const rowIndex = parseInt(row, 10) - 1; // -1 because row 0 is headers
    const colIndex = parseInt(col, 10);

    // Defensive: check if data exists
    const category = questions[colIndex];
    const questionObj = category?.questions?.[rowIndex];

    const [selected, setSelected] = useState(null);
    const [feedback, setFeedback] = useState("");

    if (!category || !questionObj) {
        return <div>Question not found</div>;
    }

    const options = questionObj.options;
    const correctAnswer = questionObj.answer.charCodeAt(0) - 65; // "A" -> 0, etc.

    const handleSelect = (idx) => {
        if (selected !== null) return; // Prevent answering multiple times
        setSelected(idx);

        if (idx === correctAnswer) {
            setFeedback("CORRECT");
            // Update score for current player
            const newScores = [...scores];
            newScores[currentPlayer] += row * 100;
            setScores(newScores);
        } else {
            setFeedback("INCORRECT");
            const newScores = [...scores];
            newScores[currentPlayer] -= row * 100;
            setScores(newScores);
        }
        
    }

    return (
        <div className="question-page">
            <h2>{category.category}, {row * 100} points</h2>
            <p>{questionObj.question}</p>
            <div className="options">
                {options.map((option, idx) => (
                    <div 
                        key={idx} 
                        className={
                            "option" + 
                            (selected === idx 
                                ? idx === correctAnswer
                                    ? " option-correct"
                                    : " option-incorrect"
                                : selected !== null && idx === correctAnswer
                                ? " option-correct"
                                : "")
                        }
                        onClick={() => handleSelect(idx)}
                        style={{ cursor: selected === null ? "pointer" : "default" }}
                    >
                        <span className="option-label">{String.fromCharCode(65 + idx)}.</span> {option}
                    </div>
                ))}
            </div>
            {selected !== null && (
                <>
                    <div className={`feedback ${feedback === "CORRECT" ? "correct" : "incorrect"}`}>
                        {feedback}
                    </div>
                    <button
                        className="back-to-grid-btn"
                        style={{ marginTop: "1.5rem" }}
                        onClick={() => {
                            const nextPlayer = (currentPlayer + 1) % players.length;
                            setCurrentPlayer(nextPlayer);
                            navigate("/grid");
                        }}
                    >
                        Back to Grid
                    </button>
                </>
            )}
            <Scoreboard players={players} scores={scores} currentPlayer={currentPlayer} />
        </div>
    );
};

export default QuestionPage;