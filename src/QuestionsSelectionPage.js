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

    // Modal state for upload instructions
    const [showUploadModal, setShowUploadModal] = useState(false);

    const exampleJson = JSON.stringify([
        {
            "category": "CATEGORY 1 NAME",
            "questions": [
                {
                    "question": "100 POINT QUESTION TEXT",
                    "options": ["OPTION A", "OPTION B", "OPTION C", "OPTION D"],
                    "answer": "B"
                },
                {
                    "question": "200 POINT QUESTION TEXT",
                    "options": ["OPTION A", "OPTION B", "OPTION C", "OPTION D"],
                    "answer": "A"
                },
                {
                    "question": "300 POINT QUESTION TEXT",
                    "options": ["OPTION A", "OPTION B", "OPTION C", "OPTION D"],
                    "answer": "C"
                },
                {
                    "question": "400 POINT QUESTION TEXT",
                    "options": ["OPTION A", "OPTION B", "OPTION C", "OPTION D"],
                    "answer": "B"
                },
                {
                    "question": "500 POINT QUESTION TEXT",
                    "options": ["OPTION A", "OPTION B", "OPTION C", "OPTION D"],
                    "answer": "D"
                },
            ]
        },
        {
            "category": "CATEGORY 2 NAME",
            "questions": [
                {
                    "question": "100 POINT QUESTION TEXT",
                    "options": ["OPTION A", "OPTION B", "OPTION C", "OPTION D"],
                    "answer": "B"
                },
                {
                    "question": "200 POINT QUESTION TEXT",
                    "options": ["OPTION A", "OPTION B", "OPTION C", "OPTION D"],
                    "answer": "A"
                },
                {
                    "question": "300 POINT QUESTION TEXT",
                    "options": ["OPTION A", "OPTION B", "OPTION C", "OPTION D"],
                    "answer": "C"
                },
                {
                    "question": "400 POINT QUESTION TEXT",
                    "options": ["OPTION A", "OPTION B", "OPTION C", "OPTION D"],
                    "answer": "B"
                },
                {
                    "question": "500 POINT QUESTION TEXT",
                    "options": ["OPTION A", "OPTION B", "OPTION C", "OPTION D"],
                    "answer": "D"
                },
            ]
        }
    ], null, 2);

    const copyExampleToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(exampleJson);
        } catch (e) {
            // Fallback: create temporary textarea
            const ta = document.createElement('textarea');
            ta.value = exampleJson;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
        }
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
                <h2 className="upload-heading"><b>OR</b> Upload Your Own Questions
                    <button type="button" className="upload-help-btn" aria-label="Upload format help" onClick={() => setShowUploadModal(true)}>?</button>
                </h2>
                <input type="file" accept=".json,application/json" onChange={handleFileChange} aria-label="jsonUpload" />
                {error && <div className="error">{error}</div>}
                <button disabled={fileContent===null} onClick={() => {onQuestionsLoaded(fileContent)}}>Use JSON file</button>
            </div>

            {showUploadModal && (
                <div className="modal-backdrop" role="dialog" aria-modal="true">
                    <div className="modal">
                        <button className="modal-close" onClick={() => setShowUploadModal(false)} aria-label="Close">×</button>
                        <h3>Upload a JSON file containing 2-6 categories of 5 questions each, formatted as the example below:</h3>
                        <div className="code-box">
                            <button className="copy-btn" onClick={copyExampleToClipboard} aria-label="Copy example">Copy 📋</button>
                            <pre>{exampleJson}</pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionsSelectionPage;