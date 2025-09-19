import { useState } from "react";

const QuestionsUploadPage = ({ 
    onQuestionsLoaded,
    useDefaultQuestions
}) => {
    const [error, setError] = useState("");
    const [fileContent, setFileContent] = useState(null);

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

    return (
        <div className="questions-upload-page">
            <h2>Upload Your Own Questions</h2>
            <input type="file" accept=".json,application/json" onChange={handleFileChange} aria-label="jsonUpload" />
            {error && <div className="error">{error}</div>}
            <button onClick={() => {onQuestionsLoaded(fileContent)}}>Use JSON file</button>
            <h2>OR Use Our Default Questions</h2>
            <button onClick={useDefaultQuestions}>Load Default Questions</button>
        </div>
    );
};

export default QuestionsUploadPage;