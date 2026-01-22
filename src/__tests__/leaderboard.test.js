import { render, screen, fireEvent } from "@testing-library/react";
import Leaderboard from "../Leaderboard";
import App from "../App";
import { addPlayers, refreshPage, getPlayerOrder, mockCategoryBank, useBankCategories } from "./testUtil.js";

beforeEach(() => {
    mockCategoryBank();
    localStorage.clear();
});

afterEach(() => {
    jest.restoreAllMocks();
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

describe("Leaderboard tie", () => {
    const players = ["Alice", "Bob", "Chloe", "Dev"];
    const scores = [200, -100, 500, 500]

    test("Multiple winners in case of tie", () => {
        render(<Leaderboard players={players} scores={scores} />);
        const cRow = screen.getByText("Chloe").closest(".leaderboard-row");
        expect(cRow).toHaveClass("leaderboard-row--winner");
        const dRow = screen.getByText("Dev").closest(".leaderboard-row");
        expect(dRow).toHaveClass("leaderboard-row--winner");
        const winners = screen.getAllByText("WINNER");
        expect(winners.length).toBe(2);
    });
});

test("Automatically takes you to leaderboard page when all questions have been answered", async () => {
    const {container} = render(<App />);

    await useBankCategories();
    const playersToAdd = ["Alice", "Bob", "Carlos"];
    addPlayers(playersToAdd);

    const questions = container.getElementsByClassName("button");
    expect(questions.length).toBe(10);

    const playersInOrder = getPlayerOrder(container);

    // Answer each question
    for (let p=0; p<questions.length; p++) {
        fireEvent.click(questions[p]);
        await screen.findByText("Q"+String(Math.floor(p/2) + 1));
        const options = container.getElementsByClassName("option-label");
        expect(options.length).toBe(4);
        fireEvent.click(options[0]);
        fireEvent.click(screen.getByText(/Back to Grid/i));
    }

    await screen.findByText("Final Scores");
    const rows = container.getElementsByClassName("leaderboard-row");
    expect(rows.length).toBe(3);

    const scores = [0, 0, -600];

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

    await useBankCategories();
    addPlayers(["Alice", "Bob", "Carlos"]);

    const questions = container.getElementsByClassName("button");
    expect(questions.length).toBe(10);

    // Answer each question
    for (let p=0; p<questions.length; p++) {
        fireEvent.click(questions[p]);
        await screen.findByText("Q"+String(Math.floor(p/2) + 1));
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