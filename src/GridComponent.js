import React from 'react';
import './GridComponent.css';

const GridComponent = ({ rows, columns }) => {
    const totalCells = rows * columns;
    const cells = Array.from({ length: totalCells }, (_, i) => i);

    return (
        <div 
            className="grid-container" 
            style={{ '--rows': rows, '--columns': columns }}
        >
            {cells.map((cell) => (
                <div key={cell} className="grid-item">
                    {(Math.floor((cell) / columns) + 1) * 100 /* Point value */} 
                </div>
            ))}
        </div>
    );
};

export default GridComponent;