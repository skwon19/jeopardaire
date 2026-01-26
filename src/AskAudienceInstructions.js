import './InstructionsPage.css';

const AskAudienceInstructions = ({
    currentPlayerName,
    closeInstructions
}) => {
    return (
        <div className="instructions-page">
            <h2>
                Ask the Audience Lifeline
            </h2>
            <p>
                Each player, besides {currentPlayerName}, will be asked to answer the question to their best knowledge 
                (not using internet or other reference materials). 
            </p>
            <p>
                {currentPlayerName} will be shown the tally of how many people selected each answer 
                (but not who selected what).
            </p>
            <p className="highlight">
                Don't let {currentPlayerName} see your responses as you answer!
            </p>
            <button onClick={closeInstructions}>Continue</button>
        </div>
    );
}

export default AskAudienceInstructions;