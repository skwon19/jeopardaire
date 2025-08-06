import React from 'react';
import { useParams } from 'react-router-dom';
import './QuestionPage.css';

const QuestionPage = ({ questions }) => {
    const { row, col } = useParams();
    // Convert row and col to numbers
    const rowIndex = parseInt(row, 10) - 1; // -1 because row 0 is headers
    const colIndex = parseInt(col, 10);

    // Defensive: check if data exists
    const category = questions[colIndex];
    const questionObj = category?.questions?.[rowIndex];

    if (!category || !questionObj) {
        return <div>Question not found</div>;
    }

    const options = questionObj.options;

    return (
        <div className="question-page">
            <h2>{category.category}, {row * 100} points</h2>
            <p>{questionObj.question}</p>
            <div className="options">
                {options.map((option, idx) => (
                    <div key={idx} className="option">
                        <span className="option-label">{String.fromCharCode(65 + idx)}.</span> {option}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuestionPage;