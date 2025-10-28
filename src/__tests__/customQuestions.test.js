import { act} from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react"; 
import App from "../App";
import { addPlayers, refreshPage, expectPlayerScore } from "./basicIntegration.test.js";

afterEach(() => {
    jest.restoreAllMocks();
});

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

test("Select categories from bank", async () => {
    // Mock fetch for /sampleCategories.json
    const fetchMock = jest.spyOn(globalThis, "fetch").mockImplementation((url) => {
        if (url.includes("/sampleCategories.json")) {
            return Promise.resolve({
                json: () => Promise.resolve([
                    {
                        category: "History",
                        questions: [
                            {
                                question: "History Q1",
                                options: ["A1", "B1", "C1", "D1"],
                                answer: "B"
                            },
                            {
                                question: "History Q2",
                                options: ["A2", "B2", "C2", "D2"],
                                answer: "A"
                            },
                            {
                                question: "History Q3",
                                options: ["A3", "B3", "C3", "D3"],
                                answer: "D"
                            },
                            {
                                question: "History Q4",
                                options: ["A4", "B4", "C4", "D4"],
                                answer: "A"
                            },
                            {
                                question: "History Q5",
                                options: ["A5", "B5", "C5", "D5"],
                                answer: "C"
                            }
                        ]
                    },
                    {
                        category: "Disney Villains",
                        questions: [
                            {
                                question: "Disney Villains Q1",
                                options: ["A1", "B1", "C1", "D1"],
                                answer: "B"
                            },
                            {
                                question: "Disney Villains Q2",
                                options: ["A2", "B2", "C2", "D2"],
                                answer: "A"
                            },
                            {
                                question: "Disney Villains Q3",
                                options: ["A3", "B3", "C3", "D3"],
                                answer: "D"
                            },
                            {
                                question: "Disney Villains Q4",
                                options: ["A4", "B4", "C4", "D4"],
                                answer: "A"
                            },
                            {
                                question: "Disney Villains Q5",
                                options: ["A5", "B5", "C5", "D5"],
                                answer: "C"
                            }
                        ]
                    },
                    {
                        category: "Fictional Places",
                        questions: [
                            {
                                question: "Fictional Places Q1",
                                options: ["A1", "B1", "C1", "D1"],
                                answer: "B"
                            },
                            {
                                question: "Fictional Places Q2",
                                options: ["A2", "B2", "C2", "D2"],
                                answer: "A"
                            },
                            {
                                question: "Fictional Places Q3",
                                options: ["A3", "B3", "C3", "D3"],
                                answer: "D"
                            },
                            {
                                question: "Fictional Places Q4",
                                options: ["A4", "B4", "C4", "D4"],
                                answer: "A"
                            },
                            {
                                question: "Fictional Places Q5",
                                options: ["A5", "B5", "C5", "D5"],
                                answer: "C"
                            }
                        ]
                    },
                    {
                        category: "Food & Drink",
                        questions: [
                            {
                                question: "Food & Drink Q1",
                                options: ["A1", "B1", "C1", "D1"],
                                answer: "B"
                            },
                            {
                                question: "Food & Drink Q2",
                                options: ["A2", "B2", "C2", "D2"],
                                answer: "A"
                            },
                            {
                                question: "Food & Drink Q3",
                                options: ["A3", "B3", "C3", "D3"],
                                answer: "D"
                            },
                            {
                                question: "Food & Drink Q4",
                                options: ["A4", "B4", "C4", "D4"],
                                answer: "A"
                            },
                            {
                                question: "Food & Drink Q5",
                                options: ["A5", "B5", "C5", "D5"],
                                answer: "C"
                            }
                        ]
                    }
                ])
            });
        }
        // Default mock for other fetches
        return Promise.resolve({
            json: () => Promise.resolve([])
        });
    });


    await act(() => {
        render(<App />);
    });

    fireEvent.click(screen.getByText(/History/i));
    fireEvent.click(screen.getByText(/Disney Villains/i));
    fireEvent.click(screen.getByText(/Fictional Places/i));
    fireEvent.click(screen.getByText(/Disney Villains/i)); // Deselect
    fireEvent.click(screen.getByText(/Food & Drink/i));

    fireEvent.click(screen.getByText(/Use Selected Categories/i));

    addPlayers(["Alice", "Bob", "Carlos"]);

    // Wait for the custom category to appear
    await screen.findByText(/History/i);
    await screen.findByText(/Fictional Places/i);
    await screen.findByText(/Food & Drink/i);
    expect(screen.queryByText(/Disney Villains/i)).not.toBeInTheDocument();
    const gridItems = screen.getAllByText("200");
    fireEvent.click(gridItems[0]);

    // Wait for question page
    await screen.findByText("History Q2");

    // Select the correct answer
    fireEvent.click(screen.getByText("A2"));

    // Should show "correct"
    await screen.findByText(/correct/i);

    // Back to grid
    fireEvent.click(screen.getByText(/Back to Grid/i));

    fetchMock.mockRestore(); // Restore fetch after this test
});