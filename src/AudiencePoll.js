import "./AudiencePoll.css";
import QuestionComponent from "./QuestionComponent";
import AskAudienceInstructions from "./AskAudienceInstructions";

const AudiencePoll = ({
    players,
    currentPlayer,
    audiencePollIndex,
    setAudiencePollIndex,
    audiencePollAnswers,
    setAudiencePollAnswers,
    question,
    validAnswer,
    correctAnswer,
    options,
    onFinishPoll,
    showHistogram,
    setShowHistogram,
    instructionsSeen,
    closeInstructions,
}) => {
    const playersToPoll = players.filter((_, idx) => idx !== currentPlayer);

    const handleSelect = (answerIdx) => {
        // Record the answer
        const updatedAnswers = [...audiencePollAnswers];
        updatedAnswers[answerIdx] = updatedAnswers[answerIdx] + 1;
        setAudiencePollAnswers(updatedAnswers);

        // Move to next player or finish
        if (audiencePollIndex < playersToPoll.length - 1) {
            setAudiencePollIndex(audiencePollIndex + 1);
        } else {
            setShowHistogram(true);
        }
    }

    if (!instructionsSeen) {
        return <AskAudienceInstructions 
                    currentPlayerName={players[currentPlayer]}
                    closeInstructions={closeInstructions}
                />
    } else {
        return (
            <div className="ask-audience">
                {!showHistogram ? (
                    <h2><strong>{playersToPoll[audiencePollIndex]}</strong>, please answer to the best of your ability</h2>
                ) : (
                    <div className="audience-histogram">
                        <h2>Ask the Audience Results</h2>
                        <div className="audience-histogram-bars">
                            {options.map((option, idx) => {
                                const count = audiencePollAnswers[idx];
                                const max = Math.max(...audiencePollAnswers, 1);
                                const barHeight = (count / max) * 120;
                                return (
                                    <div key={idx} style={{ textAlign: "center" }}>
                                        <div
                                            className="audience-histogram-bar"
                                            style={{ height: `${barHeight}px` }}
                                        ></div>
                                        <div className="audience-histogram-label">{String.fromCharCode(65 + idx)}</div>
                                        <div className="audience-histogram-count">{count}</div>
                                    </div>
                                );
                            })}
                        </div>
                        <button onClick={() => {
                            setShowHistogram(false);
                            onFinishPoll();
                        }}>Close Poll</button>
                    </div>
                )}
                
                <QuestionComponent
                    question={question}
                    selectedAnswer={null}
                    handleSelect={(answerIdx) => {
                        if (showHistogram) return;
                        handleSelect(answerIdx);
                    }}
                    validAnswer={validAnswer}
                    correctAnswer={correctAnswer}
                    options={options}
                />
            </div>
        );
    }
}

export default AudiencePoll;