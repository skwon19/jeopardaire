import { act} from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react"; 
import App from "../App";

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
                        "answer": "B1"
                    },
                    {
                        "question": "Q2",
                        "options": ["A2", "B2", "C2", "D2"],
                        "answer": "A2"
                    },
                    {
                        "question": "Q3",
                        "options": ["A3", "B3", "C3", "D3"],
                        "answer": "D3"
                    },
                    {
                        "question": "Q4",
                        "options": ["A4", "B4", "C4", "D4"],
                        "answer": "A4"
                    },
                    {
                        "question": "Q5",
                        "options": ["A5", "B5", "C5", "D5"],
                        "answer": "C5"
                    }
                ]
            },
        ])
    });
    localStorage.clear();
});


const addTwoPlayers = () => {
    const playerInputs = screen.getAllByPlaceholderText(/Player \d+/);
    fireEvent.change(playerInputs[0], { target: { value: "Alice" } });
    fireEvent.change(playerInputs[1], { target: { value: "Bob" } });

    fireEvent.click(screen.getByText(/Start Game/i));
}

const addThreePlayers = () => {
    fireEvent.click(screen.getByText(/Add Player/i));

    const playerInputs = screen.getAllByPlaceholderText(/Player \d+/);
    fireEvent.change(playerInputs[0], { target: { value: "Alice" } });
    fireEvent.change(playerInputs[1], { target: { value: "Bob" } });
    fireEvent.change(playerInputs[2], { target: { value: "Carlos" } });

    fireEvent.click(screen.getByText(/Start Game/i));
}

const refreshPage = async () => {
    // Unmount the app (simulating a page reload) and then remount it
    const { unmount } = render(<App />);
    unmount();
    cleanup();
    await act(() => {
        render(<App />);
    });
}

const expectPlayerScore = (playerName, expectedScore) => {
    expect(screen.getByText(playerName)).toBeInTheDocument();
    const player = screen.getByText(playerName);
    const playerScore = player.nextElementSibling.textContent.trim();
    expect(playerScore).toBe(expectedScore);
}

test("Lifeline 50:50 works correctly", async () => {
    await act(() => {
        render(<App />);
    });

    addThreePlayers();

    await screen.findByText((content) => content.includes("2000s Pop"));
    const gridItems300 = screen.getAllByText("300");
    fireEvent.click(gridItems300[0]);

    await screen.findByText("Q3");
    const lifelineButton = screen.getByText("50:50");
    fireEvent.click(lifelineButton);

    await waitFor(() => { // Greyed out after 1 use
        expect(lifelineButton).toHaveClass("used");
    });

    const optionA = screen.getByText("A3");
    const optionB = screen.getByText("B3");
    const optionC = screen.getByText("C3");
    const optionD = screen.getByText("D3");

    // Correct answer is D3, so two of A3, B3, C3 should be invalidated
    expect(optionD).toHaveClass("option");
    expect(optionD).not.toHaveClass("option-invalid");

    const options = [optionA, optionB, optionC];
    const invalidated = options.filter(opt => opt.classList.contains("option-invalid"));
    expect(invalidated.length).toBe(2);
    const validOptions = options.filter(opt => !opt.classList.contains("option-invalid"));
    expect(validOptions.length).toBe(1);

    // Answer the question
    fireEvent.click(optionD);

    await screen.findByText("CORRECT");
    expectPlayerScore("Alice", "300");
    expectPlayerScore("Bob", "0");
    expectPlayerScore("Carlos", "0");

    fireEvent.click(screen.getByText(/Back to Grid/i));
});

test("Lifeline 50:50 is per-player", async () => {
    await act(() => {
        render(<App />);
    });

    addThreePlayers();

    await screen.findByText((content) => content.includes("2000s Pop"));
    const gridItems300 = screen.getAllByText("300");
    fireEvent.click(gridItems300[0]);

    await screen.findByText("Q3");
    const lifelineButton1 = screen.getByText("50:50");
    fireEvent.click(lifelineButton1);

    await waitFor(() => { // Greyed out after 1 use
        expect(lifelineButton1).toHaveClass("used");
    });

    // Answer the question
    fireEvent.click(screen.getByText("D3"));
    await screen.findByText("CORRECT");
    fireEvent.click(screen.getByText(/Back to Grid/i));

    expect(screen.getByText(/Bob/).closest(".scoreboard-cell--active")).toBeInTheDocument();
    const gridItems500 = screen.getAllByText("500");
    fireEvent.click(gridItems500[0]);

    await screen.findByText("Q5");
    const lifelineButton2 = screen.getByText("50:50");

    expect(lifelineButton2).not.toHaveClass("used"); // Not used yet for Bob
    
    fireEvent.click(lifelineButton2);

    await waitFor(() => {
        expect(lifelineButton2).toHaveClass("used");
    });

    const optionA = screen.getByText("A5");
    const optionB = screen.getByText("B5");
    const optionC = screen.getByText("C5");
    const optionD = screen.getByText("D5");

    // Correct answer is C5
    expect(optionC).toHaveClass("option");
    expect(optionC).not.toHaveClass("option-invalid");

    const options = [optionA, optionB, optionD];
    const invalidated = options.filter(opt => opt.classList.contains("option-invalid"));
    expect(invalidated.length).toBe(2);
    const validOptions = options.filter(opt => !opt.classList.contains("option-invalid"));
    expect(validOptions.length).toBe(1);

    // Answer the question incorrectly
    fireEvent.click(validOptions[0]);

    await screen.findByText("INCORRECT");
    expectPlayerScore("Alice", "300");
    expectPlayerScore("Bob", "-500");
    expectPlayerScore("Carlos", "0");
});

test("Lifeline still used on next turn", async () => {
    await act(() => {
        render(<App />);
    });

    addTwoPlayers();

    await screen.findByText((content) => content.includes("2000s Pop"));
    const gridItems300 = screen.getAllByText("300");
    fireEvent.click(gridItems300[0]);

    await screen.findByText("Q3");
    const lifelineButton1 = screen.getByText("50:50");
    fireEvent.click(lifelineButton1);

    await waitFor(() => { // Greyed out after 1 use
        expect(lifelineButton1).toHaveClass("used");
    });

    // Answer the question
    fireEvent.click(screen.getByText("D3"));
    await screen.findByText("CORRECT");
    fireEvent.click(screen.getByText(/Back to Grid/i));

    expect(screen.getByText(/Bob/).closest(".scoreboard-cell--active")).toBeInTheDocument();
    const gridItems500 = screen.getAllByText("500");
    fireEvent.click(gridItems500[0]);

    await screen.findByText("Q5");
    const lifelineButton2 = screen.getByText("50:50");

    expect(lifelineButton2).not.toHaveClass("used"); // Not used yet for Bob

    const optionA = screen.getByText("A5");
    const optionB = screen.getByText("B5");
    const optionC = screen.getByText("C5");
    const optionD = screen.getByText("D5");

    for (const opt of [optionA, optionB, optionC, optionD]) {
        expect(opt).toHaveClass("option");
        expect(opt).not.toHaveClass("option-invalid");
    }

    fireEvent.click(optionC); // Answer correctly to end Bob's turn
    await screen.findByText("CORRECT");
    expectPlayerScore("Alice", "300");
    expectPlayerScore("Bob", "500");
    fireEvent.click(screen.getByText(/Back to Grid/i));

    expect(screen.getByText(/Alice/).closest(".scoreboard-cell--active")).toBeInTheDocument();
    const gridItems200 = screen.getAllByText("200");
    fireEvent.click(gridItems200[0]);

    await screen.findByText("Q2");
    const lifelineButton3 = screen.getByText("50:50");

    expect(lifelineButton3).toHaveClass("used"); // Still used for Alice
});

test("Lifeline 50:50 persists after page refresh", async () => {
    await act(() => {
        render(<App />);
    });

    addThreePlayers();

    await screen.findByText((content) => content.includes("2000s Pop"));
    const gridItems300 = screen.getAllByText("300");
    fireEvent.click(gridItems300[0]);

    await screen.findByText("Q3");
    const lifelineButton = screen.getByText("50:50");
    fireEvent.click(lifelineButton);

    await waitFor(() => { // Greyed out after 1 use
        expect(lifelineButton).toHaveClass("used");
    });

    await refreshPage();

    await screen.findByText("Q3");
    const lifelineButtonAfterRefresh = screen.getByText("50:50");
    expect(lifelineButtonAfterRefresh).toHaveClass("used");

    const optionA = screen.getByText("A3");
    const optionB = screen.getByText("B3");
    const optionC = screen.getByText("C3");
    const optionD = screen.getByText("D3");

    // Correct answer is D3, so two of A3, B3, C3 should be invalidated
    expect(optionD).toHaveClass("option");
    expect(optionD).not.toHaveClass("option-invalid");

    const options = [optionA, optionB, optionC];
    const invalidated = options.filter(opt => opt.classList.contains("option-invalid"));
    expect(invalidated.length).toBe(2);
    const validOptions = options.filter(opt => !opt.classList.contains("option-invalid"));
    expect(validOptions.length).toBe(1);

    // Answer the question
    fireEvent.click(validOptions[0]);

    await screen.findByText("INCORRECT");
    expectPlayerScore("Alice", "-300");
    expectPlayerScore("Bob", "0");
    expectPlayerScore("Carlos", "0");

    fireEvent.click(screen.getByText(/Back to Grid/i));
});

test("Lifeline 50:50 persists after page refresh", async () => {
    await act(() => {
        render(<App />);
    });

    addThreePlayers();

    await screen.findByText((content) => content.includes("2000s Pop"));
    const gridItems300 = screen.getAllByText("300");
    fireEvent.click(gridItems300[0]);

    await screen.findByText("Q3");
    const lifelineButton = screen.getByText("50:50");
    fireEvent.click(lifelineButton);

    await waitFor(() => { // Greyed out after 1 use
        expect(lifelineButton).toHaveClass("used");
    });

    // Answer the question
    fireEvent.click(screen.getByText("D3"));

    await refreshPage();

    await screen.findByText("Q3");
    const lifelineButtonAfterRefresh = screen.getByText("50:50");
    expect(lifelineButtonAfterRefresh).toHaveClass("used");  

    await screen.findByText("CORRECT");
    expectPlayerScore("Alice", "300");
    expectPlayerScore("Bob", "0");
    expectPlayerScore("Carlos", "0");

    fireEvent.click(screen.getByText(/Back to Grid/i));
});