import './LifelinesComponent.css';

const LifeLinesComponent = ({
    correctAnswer,
    validAnswer,
    invalidateAnswers,
    lifelinesUsed,
    setLifelinesUsed,
    currentPlayer,
    penalties
}) => {
    const removeTwoWrongAnswers = () => { // Invalidate two wrong answers
        const wrongAnswers = [];
        for (let i = 0; i < 4; i++) {
            if (i !== correctAnswer && validAnswer[i]) {
                wrongAnswers.push(i);
            }
        }

        if (wrongAnswers.length <= 2) {
            invalidateAnswers(wrongAnswers);
        } else { // 3 wrong answers
            // Randomly pick one to keep
            const keep = Math.floor(Math.random() * wrongAnswers.length);
            wrongAnswers.splice(keep, 1);
            invalidateAnswers(wrongAnswers);
        }
    }

    const removeOneWrongAnswer = () => { // Invalidate one wrong answers
        const wrongAnswers = [];
        for (let i = 0; i < 4; i++) {
            if (i !== correctAnswer && validAnswer[i]) {
                wrongAnswers.push(i);
            }
        }

        if (wrongAnswers.length !== 0) {
            // Randomly pick one to remove
            const remove = Math.floor(Math.random() * wrongAnswers.length);
            invalidateAnswers([wrongAnswers[remove]]);
        }
    }


    return (
        <div className="lifeline-container">
            Lifelines
            <div
                className={"lifeline" + (lifelinesUsed[currentPlayer]["50:50"] ? " used" : "")}
                onClick={() => {
                    if (lifelinesUsed[currentPlayer]["50:50"]) return; // Already used
                    removeTwoWrongAnswers();
                    const newLifelines = {... lifelinesUsed};
                    newLifelines[currentPlayer]["50:50"] = true;
                    setLifelinesUsed(newLifelines);
                }}
            >
                50:50
            </div>
            <div
                className={"lifeline" + (lifelinesUsed[currentPlayer]["phone"] ? " used" : "")}
                onClick={() => {
                    if (lifelinesUsed[currentPlayer]["50:50"]) return; // Already used
                    const newLifelines = {... lifelinesUsed};
                    newLifelines[currentPlayer]["phone"] = true;
                    setLifelinesUsed(newLifelines);
                }}
            >
                Phone a Friend (offline)
            </div>
            <div
                className="lifeline"
                onClick={removeOneWrongAnswer}
            >
                {penalties[currentPlayer]}
            </div>
        </div>
    )
}

export default LifeLinesComponent;