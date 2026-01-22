import { act} from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react"; 
import App from "../App";

// Mock fetch for sampleCategories.json
export const mockCategoryBank = () => {
    global.fetch = jest.fn().mockResolvedValue({
        json: () => Promise.resolve([
            {
                "category": "Geography",
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
            {
                "category": "History",
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
}

export const addPlayers = (playerNames, playerPenalties) => {
    if (!playerPenalties) {
        playerPenalties = playerNames.map(name => `Do penalty`);
    }

    if (playerNames.length > 2) {
        for (let i = 0; i < playerNames.length - 2; i++) {
            fireEvent.click(screen.getByText(/Add Player/i));
        }
    }
    const playerInputs = screen.getAllByPlaceholderText(/Player \d+/);
    for (let i = 0; i < playerNames.length; i++) {
        fireEvent.change(playerInputs[i], { target: { value: playerNames[i] } });
    }
    const penaltyInputs = screen.getAllByPlaceholderText(/Penalty/);
    for (let i = 0; i < playerNames.length; i++) {
        fireEvent.change(penaltyInputs[i], { target: { value: playerPenalties[i]} });
    }
    fireEvent.click(screen.getByText(/Start Game/i));
}

export const refreshPage = async () => {
    // Unmount the app (simulating a page reload) and then remount it
    const { unmount } = render(<App />);
    unmount();
    cleanup();
    await act(() => {
        render(<App />);
    });
}

export const expectPlayerScore = (playerName, expectedScore) => {
    expect(screen.getByText(playerName)).toBeInTheDocument();
    const player = screen.getByText(playerName);
    const playerScore = player.nextElementSibling.textContent.trim();
    expect(playerScore).toBe(expectedScore);
}

export const getPlayerOrder = (container) => {
    const playerElts = container.getElementsByClassName("scoreboard-cell");
    const playerOrder = [];
    for (let elt of playerElts) {
        const name = elt.querySelector(".scoreboard-name").textContent.trim();
        playerOrder.push(name);
    }
    return playerOrder;
}

export const useBankCategories = async () => {
    await screen.findByText(/History/i);
    fireEvent.click(screen.getByText(/History/i));
    await screen.findByText(/Geography/i);
    fireEvent.click(screen.getByText(/Geography/i));
    fireEvent.click(screen.getByText(/Use Selected Categories/i));
}

// Must have test in file
test("Dummy test", async () => {
    expect(true).toBe(true);
});