import { useEffect, useState } from "react";
import './QuestionSelectionPage.css';

const QuestionsSelectionPage = ({ 
    onQuestionsLoaded,
    useDefaultQuestions
}) => {
    const [error, setError] = useState("");
    const [fileContent, setFileContent] = useState(null);
    const [bankCategories, setBankCategories] = useState([]);
    const [bankQuestions, setBankQuestions] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState([]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const text = await file.text();
            const json = JSON.parse(text);
            // TODO validate the structure here
            setFileContent(json);
            setError("");
        } catch (err) {
            setError("Invalid JSON file. Please upload a valid questions file.");
        }
    };

    const getBankQuestions = async () => { // Get all preset questions from the bank
        const response = await fetch("/sampleCategories.json");
        const data = await response.json();
        setBankQuestions(data);
        const categoryNames = data.map(item => item.category);
        setBankCategories(categoryNames);
    };

    // Load bank questions if empty
    useEffect(() => {
        if (bankCategories.length === 0) {
            getBankQuestions();
        }
    }, [bankCategories]);

    const handleCategoryClick = (category, idx) => {
        if (selectedCategories.includes(category)) {
            setSelectedCategories(selectedCategories.filter(c => c !== category));
            setSelectedQuestions(selectedQuestions.filter(q => q.category !== category));
        } else if (selectedCategories.length < 6) {
            setSelectedCategories([...selectedCategories, category]);
            setSelectedQuestions([...selectedQuestions, bankQuestions[idx]]);
        }
    };

    const handleUseCategories = () => {
        if (selectedCategories.length < 2 || selectedCategories.length > 6) {
            setError("Please select between 2 and 6 categories.");
            return;
        }
        setError("");
        onQuestionsLoaded(selectedQuestions);
    }

    return (
        <div className="questions-selection-page">
            
            <div>
                <h2>Choose from a Bank of Categories (choose 2-6 categories)</h2>
                <div className="bank-categories-list">
                    {bankCategories.map((category, idx) => (
                        <button 
                            key={idx}
                            type="button"
                            onClick={() => handleCategoryClick(category, idx)}
                            className={selectedCategories.includes(category) ? "selected" : ""}
                        >
                            {category}
                        </button>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={handleUseCategories}
                    disabled={selectedCategories.length < 2 || selectedCategories.length > 6}
                >
                    Use Selected Categories
                </button>
            </div>
            <div>
                <h2><b>OR</b> Upload Your Own Questions</h2>
                <input type="file" accept=".json,application/json" onChange={handleFileChange} aria-label="jsonUpload" />
                {error && <div className="error">{error}</div>}
                <button disabled={fileContent===null} onClick={() => {onQuestionsLoaded(fileContent)}}>Use JSON file</button>
            </div>
        </div>
    );
};

export default QuestionsSelectionPage;