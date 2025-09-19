import { act} from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react"; 
import App from "../App";
import { addPlayers, refreshPage, expectPlayerScore } from "./basicIntegration.test.js";

test("Upload custom JSON questions file", async () => {
    await act(() => {
        render(<App />);
    });

    // Prepare mock JSON file
    const customQuestions = [
        {
            "category": "Category 1",
            "questions": [
                {
                    "question": "Custom Q1",
                    "options": ["Custom A1", "Custom B1", "Custom C1", "Custom D1"],
                    "answer": "B"
                },
                {
                    "question": "Custom Q2",
                    "options": ["Custom A2", "Custom B2", "Custom C2", "Custom D2"],
                    "answer": "A"
                },
                {
                    "question": "Custom Q3",
                    "options": ["Custom A3", "Custom B3", "Custom C3", "Custom D3"],
                    "answer": "D"
                },
                {
                    "question": "Custom Q4",
                    "options": ["Custom A4", "Custom B4", "Custom C4", "Custom D4"],
                    "answer": "A"
                },
                {
                    "question": "Custom Q5",
                    "options": ["Custom A5", "Custom B5", "Custom C5", "Custom D5"],
                    "answer": "C"
                }
            ]
        },
        {
            "category": "Category 2",
            "questions": [
                {
                    "question": "Custom Q1-2",
                    "options": ["Custom A1", "Custom B1", "Custom C1", "Custom D1"],
                    "answer": "B"
                },
                {
                    "question": "Custom Q2-2",
                    "options": ["Custom A2", "Custom B2", "Custom C2", "Custom D2"],
                    "answer": "A"
                },
                {
                    "question": "Custom Q3-2",
                    "options": ["Custom A3", "Custom B3", "Custom C3", "Custom D3"],
                    "answer": "D"
                },
                {
                    "question": "Custom Q4-2",
                    "options": ["Custom A4", "Custom B4", "Custom C4", "Custom D4"],
                    "answer": "A"
                },
                {
                    "question": "Custom Q5-2",
                    "options": ["Custom A5", "Custom B5", "Custom C5", "Custom D5"],
                    "answer": "C"
                }
            ]
        }
    ];
    const file = new File([JSON.stringify(customQuestions)], "customQuestions.json", { type: "application/json" });
    Object.defineProperty(file, 'text', {
      value: jest.fn().mockResolvedValue(JSON.stringify(customQuestions)),
    });

    // Find the file input
    const fileInput = screen.getByLabelText(/jsonUpload/i);
    // Simulate file upload
    await act(async () => {
        fireEvent.change(fileInput, { target: { files: [file] } });
    });

    // Click "Use JSON file" button if needed
    fireEvent.click(screen.getByText(/Use JSON file/i));

    addPlayers(["Alice", "Bob", "Carlos"]);

    // Wait for the custom category to appear
    await screen.findByText((content) => content.includes("Category 1"));

    const gridItems = screen.getAllByText("200");
    fireEvent.click(gridItems[1]); // 2nd category

    // Wait for question page
    await screen.findByText("Custom Q2-2");

    // Select the correct answer
    fireEvent.click(screen.getByText("Custom A2"));

    // Should show "correct"
    await screen.findByText(/correct/i);

    // Back to grid
    fireEvent.click(screen.getByText(/Back to Grid/i));

});