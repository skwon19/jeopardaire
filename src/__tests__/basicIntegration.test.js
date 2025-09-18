import { act} from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react"; 
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

test("fetch mock works", async () => {
    const response = await fetch("/questions.json");
    const data = await response.json();
    expect(data[0].category).toBe("2000s Pop");
});

test("add players, answer question correctly, update score, and grid updates", async () => {
    await act(() => {
        render(<App />);
    });

    // Add two players
    addPlayers(["Alice", "Bob"]);

    // Wait for grid to appear
    await screen.findByText((content) => content.includes("2000s Pop"));

    // Click on 2000s Pop for 200 (row 2, col 0)
    const gridItems = screen.getAllByText("200");
    fireEvent.click(gridItems[0]);

    // Wait for question page
    await screen.findByText("Q2");

    // Select the correct answer
    fireEvent.click(screen.getByText("A2"));

    // Should show "correct"
    await screen.findByText(/correct/i);

    // Back to grid
    fireEvent.click(screen.getByText(/Back to Grid/i));

    // Alice's score should be 200
    expectPlayerScore("Alice", "200");
    expectPlayerScore("Bob", "0");

    const seen200 = Array.from(document.querySelectorAll(".grid-item.seen"))
        .find(el => el.textContent.trim() === "200"); // Question is marked seen
    expect(seen200).toBeInTheDocument();

    // Bob's turn now
    expect(screen.getByText(/Bob/).closest(".scoreboard-cell--active")).toBeInTheDocument();

});

test("answer question incorrectly, update score", async () => {
    await act(() => {
        render(<App />);
    });

    addPlayers(["Alice", "Bob"]);

    // Wait for grid to appear
    await screen.findByText((content) => content.includes("2000s Pop"));

    // Click on 2000s Pop for 300 (row 2, col 0)
    const gridItems = screen.getAllByText("300");
    fireEvent.click(gridItems[0]);

    // Wait for question page
    await screen.findByText("Q3");

    // Select incorrect answer
    fireEvent.click(screen.getByText("B3"));

    // Should show "incorrect" and update score
    await screen.findByText(/incorrect/i);

    expectPlayerScore("Alice", "-300");
    expectPlayerScore("Bob", "0");

    expect(screen.getByText(/Alice/).closest(".scoreboard-cell--active")).toBeInTheDocument();

    // Back to grid
    fireEvent.click(screen.getByText(/Back to Grid/i));

    const seen200 = Array.from(document.querySelectorAll(".grid-item.seen"))
        .find(el => el.textContent.trim() === "300"); // Question is marked seen
    expect(seen200).toBeInTheDocument();

    expect(screen.getByText(/Bob/).closest(".scoreboard-cell--active")).toBeInTheDocument();
});

test("answer question, back to grid, game state persists after reload", async () => {
    await act(() => {
        render(<App />);
    });

    addPlayers(["Alice", "Bob"]);
    // Wait for grid to appear
    await screen.findByText((content) => content.includes("2000s Pop"));
    // Click on 2000s Pop for 300 (row 2, col 0)
    const gridItems = screen.getAllByText("300");
    fireEvent.click(gridItems[0]);
    // Wait for question page
    await screen.findByText("Q3");
    // Select incorrect answer
    fireEvent.click(screen.getByText("B3"));
    // Back to grid
    fireEvent.click(screen.getByText(/Back to Grid/i));

    await refreshPage();

    // Check that the state is restored
    expect(screen.getByText(/Alice/)).toBeInTheDocument();
    expect(screen.getByText(/Bob/)).toBeInTheDocument();

    // Alice's score should still be -300
    expectPlayerScore("Alice", "-300");

    // Bob's score should still be 0
    expectPlayerScore("Bob", "0");

    // Bob's turn now
    expect(screen.getByText(/Bob/).closest(".scoreboard-cell--active")).toBeInTheDocument();

    // The 300 question should still be marked as seen
    const seen300 = Array.from(document.querySelectorAll(".grid-item.seen"))
        .find(el => el.textContent.trim() === "300");
    expect(seen300).toBeInTheDocument();
});

test("refresh while on question page before answering question", async () => {
    await act(() => {
        render(<App />);
    });

    addPlayers(["Alice", "Bob"]);
    await screen.findByText((content) => content.includes("2000s Pop"));
    const gridItems = screen.getAllByText("400");
    fireEvent.click(gridItems[0]);

    expect(screen.getByText("Q4")).toBeInTheDocument();

    await refreshPage();

    // Should still be on the question page
    expect(screen.getByText("Q4")).toBeInTheDocument();
});

test("refresh while on question page after answering question", async () => {
    await act(() => {
        render(<App />);
    });

    addPlayers(["Alice", "Bob"]);
    await screen.findByText((content) => content.includes("2000s Pop"));
    const gridItems = screen.getAllByText("400");
    fireEvent.click(gridItems[0]);
    expect(screen.getByText("Q4")).toBeInTheDocument();
    fireEvent.click(screen.getByText("A4")); // correct answer

    // Should show "correct"
    await screen.findByText(/correct/i);
    // Alice's score should be 400, still her turn
    expectPlayerScore("Alice", "400");
    expect(screen.getByText(/Alice/).closest(".scoreboard-cell--active")).toBeInTheDocument();

    expect(screen.getByText("A4").closest(".option-correct")).toBeInTheDocument();

    expectPlayerScore("Bob", "0");

    await refreshPage();

    // Should still be on the question page
    expect(screen.getByText("Q4")).toBeInTheDocument();
    // Should still show "correct"
    await screen.findByText(/correct/i);
    expect(screen.getByText("A4").closest(".option-correct")).toBeInTheDocument();

    // Alice's score should be 400, still her turn
    expectPlayerScore("Alice", "400");
    expect(screen.getByText(/Alice/).closest(".scoreboard-cell--active")).toBeInTheDocument();

    expectPlayerScore("Bob", "0");

});

test("two players, two turns", async () => {
    await act(() => {
        render(<App />);
    });

    addPlayers(["Alice", "Bob"]);

    await screen.findByText((content) => content.includes("2000s Pop"));
    const gridItems400 = screen.getAllByText("400");
    fireEvent.click(gridItems400[0]);
    expect(screen.getByText("Q4")).toBeInTheDocument();
    fireEvent.click(screen.getByText("C4")); // incorrect answer
    await screen.findByText(/incorrect/i);

    fireEvent.click(screen.getByText(/Back to Grid/i));
    expect(screen.getByText(/Bob/).closest(".scoreboard-cell--active")).toBeInTheDocument();
    const gridItems100 = screen.getAllByText("100");
    fireEvent.click(gridItems100[0]);
    expect(screen.getByText("Q1")).toBeInTheDocument();

    const feedback = screen.queryByText(/CORRECT|INCORRECT/i)
    expect(feedback).toBeNull()

    fireEvent.click(screen.getByText("B1")); // correct answer
    await screen.findByText(/correct/i);

    expectPlayerScore("Alice", "-400");
    expectPlayerScore("Bob", "100");

    fireEvent.click(screen.getByText(/Back to Grid/i));
    expect(screen.getByText(/Alice/).closest(".scoreboard-cell--active")).toBeInTheDocument();
});

test("three players", async () => {
    await act(() => {
        render(<App />);
    });

    addPlayers(["Alice", "Bob", "Carlos"]);

    await screen.findByText((content) => content.includes("2000s Pop"));
    const gridItems = screen.getAllByText("300");
    fireEvent.click(gridItems[0]);
    
    await screen.findByText("Q3");
    expect(screen.getByText(/Alice/).closest(".scoreboard-cell--active")).toBeInTheDocument();
    fireEvent.click(screen.getByText("D3")); // correct answer
    await screen.findByText(/correct/i);
    expectPlayerScore("Alice", "300");
    expectPlayerScore("Bob", "0");
    expectPlayerScore("Carlos", "0");
    
    fireEvent.click(screen.getByText(/Back to Grid/i));
    // Bob's turn now
    expect(screen.getByText(/Bob/).closest(".scoreboard-cell--active")).toBeInTheDocument();

});

test("three players, four turns", async () => {
    await act(() => {
        render(<App />);
    });

    addPlayers(["Alice", "Bob", "Carlos"]);

    await screen.findByText((content) => content.includes("2000s Pop"));
    const gridItems300 = screen.getAllByText("300");
    fireEvent.click(gridItems300[0]);
    
    await screen.findByText("Q3");
    expect(screen.getByText(/Alice/).closest(".scoreboard-cell--active")).toBeInTheDocument();
    fireEvent.click(screen.getByText("D3")); // correct answer
    await screen.findByText(/correct/i);
    fireEvent.click(screen.getByText(/Back to Grid/i));
    
    expect(screen.getByText(/Bob/).closest(".scoreboard-cell--active")).toBeInTheDocument(); // Bob's turn now
    const gridItems100 = screen.getAllByText("100");
    fireEvent.click(gridItems100[0]);

    await screen.findByText("Q1");
    fireEvent.click(screen.getByText("A1"));
    await screen.findByText(/incorrect/i);
    fireEvent.click(screen.getByText(/Back to Grid/i));

    expect(screen.getByText(/Carlos/).closest(".scoreboard-cell--active")).toBeInTheDocument(); // Carlos's turn now
    const gridItems500 = screen.getAllByText("500");
    fireEvent.click(gridItems500[0]);

    await screen.findByText("Q5");
    fireEvent.click(screen.getByText("C5"));
    await screen.findByText(/correct/i);
    fireEvent.click(screen.getByText(/Back to Grid/i));

    expect(screen.getByText(/Alice/).closest(".scoreboard-cell--active")).toBeInTheDocument(); // Alice's turn now
    const gridItems400 = screen.getAllByText("400");
    fireEvent.click(gridItems400[0]);

    await screen.findByText("Q4");
    fireEvent.click(screen.getByText("A4"));
    await screen.findByText(/correct/i);
    fireEvent.click(screen.getByText(/Back to Grid/i));

    expect(screen.getByText(/Bob/).closest(".scoreboard-cell--active")).toBeInTheDocument(); // Bob's turn now
    expectPlayerScore("Alice", "700");
    expectPlayerScore("Bob", "-100");
    expectPlayerScore("Carlos", "500");
});