import React from 'react';
import './GridComponent.css';

const GridComponent = ({ rows, columns, headers, onQuestionSelect }) => {
    return (
        <div 
            className="grid-container"
            style={{"--rows": rows, "--columns": columns }}
        >
            {Array.from( { length: rows }).map((_, rowIndex) => (
                <React.Fragment key={rowIndex}>
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            className="grid-item"
                            onClick={
                                rowIndex !== 0
                                    ? () => onQuestionSelect(rowIndex, colIndex) // row 0 is headers
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
                    ))}
                </React.Fragment>
            ))}
        </div>
    );
};

export default GridComponent;