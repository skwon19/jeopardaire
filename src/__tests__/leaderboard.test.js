import { act } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Leaderboard from "../Leaderboard";
import App from "../App";
import { addPlayers, refreshPage, expectPlayerScore, getPlayerOrder } from "./basicIntegration.test.js";

// Mock fetch for questions.json
beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
        json: () => Promise.resolve([
            {
                "category": "2000s Pop",
                "questions": [
                    {
                        "question": "Q1",
                        "options": ["A1", "B1", "C1", "D1"],
                        "answer": "B"
                    },
                    {
                        "question": "Q2",
                        "options": ["A2", "B2", "C2", "D2"],
                        "answer": "A"
                    },
                    {
                        "question": "Q3",
                        "options": ["A3", "B3", "C3", "D3"],
                        "answer": "D"
                    },
                    {
                        "question": "Q4",
                        "options": ["A4", "B4", "C4", "D4"],
                        "answer": "A"
                    },
                    {
                        "question": "Q5",
                        "options": ["A5", "B5", "C5", "D5"],
                        "answer": "C"
                    }
                ]
            },
        ])
    });
    localStorage.clear();
});

describe("Leaderboard", () => {
    const players = ["Alice", "Bob", "Charlie"];
    const scores = [150, 300, -200];

    test("renders final scores sorted from greatest to least", () => {
        render(<Leaderboard players={players} scores={scores} />);
        const rows = screen.getAllByText(/Alice|Bob|Charlie/);
        // Bob should be first (highest score), then Charlie, then Alice
        expect(rows[0]).toHaveTextContent("Bob");
        expect(rows[1]).toHaveTextContent("Alice");
        expect(rows[2]).toHaveTextContent("Charlie");
    });

    test("highlights the winner and displays WINNER label", () => {
        render(<Leaderboard players={players} scores={scores} />);
        const winnerRow = screen.getByText("Bob").closest(".leaderboard-row");
        expect(winnerRow).toHaveClass("leaderboard-row--winner");
        expect(screen.getByText("WINNER")).toBeInTheDocument();
    });

    test("displays correct scores for each player", () => {
        const {container} = render(<Leaderboard players={players} scores={scores} />);

        const rows = container.getElementsByClassName("leaderboard-row");
        expect(rows.length).toBe(3);

        const scoresInOrder = scores.toSorted((a,b) => b-a);

        for (let i=0; i < rows.length; i++) {
            let row = rows[i];
            let scoreElem = row.querySelector(".leaderboard-score");
            expect(scoreElem).toBeInTheDocument();
            expect(scoreElem.textContent).toBe(String(scoresInOrder[i]));
        }
    });
});

test("Automatically takes you to leaderboard page when all questions have been answered", async () => {
    const {container} = render(<App />);

    await act(() => {
        fireEvent.click(screen.getByText(/Load Default Questions/i));
    });

    const playersToAdd = ["Alice", "Bob", "Carlos"];
    addPlayers(playersToAdd);

    const questions = container.getElementsByClassName("button");
    expect(questions.length).toBe(5);

    const playersInOrder = getPlayerOrder(container);

    // Answer each question
    for (let p=0; p<questions.length; p++) {
        fireEvent.click(questions[p]);
        await screen.findByText("Q"+String(p+1));
        const options = container.getElementsByClassName("option-label");
        expect(options.length).toBe(4);
        fireEvent.click(options[0]);
        fireEvent.click(screen.getByText(/Back to Grid/i));
    }

    await screen.findByText("Final Scores");
    const rows = container.getElementsByClassName("leaderboard-row");
    expect(rows.length).toBe(3);

    const scores = [300, -300, -300];

    for (let i=0; i < rows.length; i++) {
        let row = rows[i];
        let scoreElt = row.querySelector(".leaderboard-score");
        expect(scoreElt).toBeInTheDocument();
        expect(scoreElt.textContent).toBe(String(scores[i]));

        let nameElt = row.querySelector(".leaderboard-name");
        expect(nameElt).toBeInTheDocument();
        let name = nameElt.textContent;
        if (i === 0) {
            expect(name).toBe(playersInOrder[0]);
        } else {
            expect([playersInOrder[1], playersInOrder[2]]).toContain(name);
        }
    }
});

test("Play again button starts new game", async () => {
    const {container} = render(<App />);

    await act(() => {
        fireEvent.click(screen.getByText(/Load Default Questions/i));
    });

    addPlayers(["Alice", "Bob", "Carlos"]);

    const questions = container.getElementsByClassName("button");
    expect(questions.length).toBe(5);

    // Answer each question
    for (let p=0; p<questions.length; p++) {
        fireEvent.click(questions[p]);
        await screen.findByText("Q"+String(p+1));
        const options = container.getElementsByClassName("option-label");
        expect(options.length).toBe(4);
        fireEvent.click(options[0]);
        fireEvent.click(screen.getByText(/Back to Grid/i));
    }

    await screen.findByText(/Final Scores/);
    
    fireEvent.click(screen.getByText(/Play again/));
    refreshPage(); // Simulate refresh page (in actual, this is done automatically)

    await screen.findByText(/Upload Your Own Questions/);

    const newQuestions = JSON.parse(localStorage.getItem("questions"));
    expect(newQuestions).toEqual([]);
    const newPlayers = JSON.parse(localStorage.getItem("players"));
    expect(newPlayers).toEqual([]);
});