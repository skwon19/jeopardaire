import './QuestionPage.css';

const QuestionComponent = ({ 
    question,
    selectedAnswer,
    handleSelect,
    validAnswer,
    correctAnswer,
    options
}) => {
    const optionTags = (idx) => {
        if (selectedAnswer === null) {
            if (validAnswer[idx]) {
                return "";
            } else {
                return " option-invalid";
            }
        } else {
            if (selectedAnswer === idx) {
                if (idx === correctAnswer) {
                    return " option-correct";
                } else {
                    return " option-incorrect";
                }
            } else if (idx === correctAnswer) {
                return " option-correct";
            } else {
                return "";
            }
        }
    }


    return (
        <div className="question-component">
            <p>{question}</p>
            <div className="options">
                {options.map((option, idx) => (
                    <div 
                        key={idx} 
                        className={
                            "option" + optionTags(idx)
                        }
                        onClick={() => handleSelect(idx)}
                        style={{ cursor: selectedAnswer === null ? "pointer" : "default" }}
                    >
                        <span className="option-label">{String.fromCharCode(65 + idx)}.</span> {option}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default QuestionComponent;