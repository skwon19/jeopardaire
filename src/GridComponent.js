import React from 'react';
import './GridComponent.css';
import { Link } from 'react-router-dom';

const GridComponent = ({ rows, columns, headers }) => {
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
                        >
                            {rowIndex === 0 ? (
                                <span className="header">
                                    {headers[colIndex] || `Header ${colIndex + 1}`}
                                </span>
                            ) : (
                                <Link
                                    to={`/page/${rowIndex}/${colIndex}`}
                                    className="button"
                                >
                                    {rowIndex * 100}
                                </Link>
                            )}
                        </div>
                    ))}
                </React.Fragment>
            ))}
        </div>
    );
};

export default GridComponent;