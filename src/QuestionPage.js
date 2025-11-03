import { useEffect, useState } from "react";
import './QuestionPage.css';
import Scoreboard from "./Scoreboard";
import LifeLinesComponent from "./LifelinesComponent";
import QuestionComponent from "./QuestionComponent";

const QuestionPage = ({ 
    questions, 
    scores, 
    setScores, 
    currentPlayer,
    players,
    row,
    col,
    onClose,
    selectedAnswers,
    setSelectedAnswers,
    feedbacks,
    setFeedbacks,
    lifelinesUsed,
    setLifelinesUsed,
    penalties,
    handleAskAudience
}) => {

    const [validAnswer, setValidAnswer] = useState(() => {
        const saved = localStorage.getItem("validAnswer");
        return saved ? JSON.parse(saved) : Array(4).fill(true);
    });

    useEffect(() => {
        localStorage.setItem("validAnswer", JSON.stringify(validAnswer));
    }, [validAnswer]);

    // Defensive: check if data exists
    const category = questions[col];
    const questionObj = category?.questions?.[row-1]; // row 0 is header

    if (!category || !questionObj) {
        return <div>Question not found</div>;
    }

    const options = questionObj.options;
    const correctAnswer = questionObj.answer.charCodeAt(0) - 65; // "A" -> 0, etc.

    const handleSelect = (idx) => {
        if (selectedAnswers[row-1][col] !== null) return; // Prevent answering multiple times
        
        const updatedSelected = selectedAnswers.map(row => [...row]);
        updatedSelected[row - 1][col] = idx; // row 0 is headers
        setSelectedAnswers(updatedSelected);

        if (idx === correctAnswer) {
            const updatedFeedback = feedbacks.map(row => [...row]);
            updatedFeedback[row - 1][col] = "CORRECT"; // row 0 is headers
            setFeedbacks(updatedFeedback);


            // Update score for current player
            const newScores = [...scores];
            newScores[currentPlayer] += row * 100;
            setScores(newScores);
        } else {
            const updatedFeedback = feedbacks.map(row => [...row]);
            updatedFeedback[row - 1][col] = "INCORRECT"; // row 0 is headers
            setFeedbacks(updatedFeedback);

            const newScores = [...scores];
            newScores[currentPlayer] -= row * 100;
            setScores(newScores);
        }
        setValidAnswer(Array(4).fill(true)); // Reset valid answers for next question
    }

    const invalidateAnswers = (indices) => {
        const newValid = [...validAnswer];
        indices.forEach(idx => {
            newValid[idx] = false;
        });
        setValidAnswer(newValid);
    }

    return (
        <div className="question-page">
            <h2>{category.category}, {row * 100} points</h2>
            <QuestionComponent
                question={questionObj.question}
                selectedAnswer={selectedAnswers[row-1][col]}
                handleSelect={handleSelect}
                validAnswer={validAnswer}
                correctAnswer={correctAnswer}
                options={options}
            />
            {selectedAnswers[row-1][col] !== null && (
                <>
                    <div className={`feedback ${feedbacks[row-1][col] === "CORRECT" ? "correct" : "incorrect"}`}>
                        {feedbacks[row-1][col]}
                    </div>
                    <button
                        className="back-to-grid-btn"
                        style={{ marginTop: "1.5rem" }}
                        onClick={() => {
                            onClose();
                        }}
                    >
                        Back to Grid
                    </button>
                </>
            )}
            <LifeLinesComponent 
                correctAnswer={correctAnswer}
                validAnswer={validAnswer}
                invalidateAnswers={invalidateAnswers}
                lifelinesUsed={lifelinesUsed}
                setLifelinesUsed={setLifelinesUsed}
                currentPlayer={currentPlayer}
                penalties={penalties}
                handleAskAudience={handleAskAudience}
            />
            <Scoreboard players={players} scores={scores} currentPlayer={currentPlayer} />
        </div>
    );
};

export default QuestionPage;