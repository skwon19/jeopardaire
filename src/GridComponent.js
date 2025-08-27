import React from 'react';
import './GridComponent.css';

const GridComponent = ({ rows, columns, headers, onQuestionSelect, seenQuestions }) => {
    const isSeen = (row, col) => {
        if (row === 0) { // row 0 is headers
            return false;
        }
        return seenQuestions[row - 1][col]; // row 0 is headers
    }
    
    return (
        <div 
            className="grid-container"
            style={{"--rows": rows, "--columns": columns }}
        >
            {Array.from( { length: rows }).map((_, rowIndex) => (
                <React.Fragment key={rowIndex}>
                    {Array.from({ length: columns }).map((_, colIndex) => {
                        const seen = isSeen(rowIndex, colIndex);
                        return (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                className={`grid-item${seen ? " seen" : ""}`}
                                onClick={
                                    rowIndex !== 0 && !seen // row 0 is headers
                                        ? () => onQuestionSelect(rowIndex, colIndex)
                                        : undefined
                                }
                            >
                                {rowIndex === 0 ? (
                                    <span className="header" >
                                        {headers[colIndex] || `Header ${colIndex + 1}`}
                                    </span>
                                ) : (
                                    <span className="button">{rowIndex * 100}</span>
                                )}
                            </div>
                        );
                    })}
                </React.Fragment>
            ))}
        </div>
    );
};

export default GridComponent;