import { render, screen, fireEvent } from "@testing-library/react"; 
import App from "../App";
import { mockCategoryBank, addPlayers, refreshPage, expectPlayerScore, getPlayerOrder, useBankCategories } from "./testUtil";


beforeEach(() => {
    mockCategoryBank();
    localStorage.clear();
});

afterEach(() => {
    jest.restoreAllMocks();
});

test("fetch mock works", async () => {
    const response = await fetch("/sampleCategories.json");
    const data = await response.json();
    expect(data[0].category).toBe("Geography");
    expect(data[1].category).toBe("History");
    expect(data.length).toBe(2);
});

test("add players, answer question correctly, update score, and grid updates", async () => {
    const {container} = render(<App />);

    // Wait for bank categories to appear, then select them.
    await useBankCategories();

    // Add two players
    const playersToAdd = ["Alice", "Bob"];
    addPlayers(playersToAdd);

    // Wait for grid to appear
    await screen.findByText((content) => content.includes("History"));

    const playersInOrder = getPlayerOrder(container);
    expect(playersInOrder.length).toBe(playersToAdd.length);
    for (let name of playersToAdd) {
        expect(playersInOrder).toContain(name);
    }

    // Click on History for 200 (row 2, col 0)
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

    expectPlayerScore(playersInOrder[0], "200");
    expectPlayerScore(playersInOrder[1], "0");

    const seen200 = Array.from(document.querySelectorAll(".grid-item.seen"))
        .find(el => el.textContent.trim() === "200"); // Question is marked seen
    expect(seen200).toBeInTheDocument();

    // Player 2's turn now
    expect(screen.getByText(playersInOrder[1]).closest(".scoreboard-cell--active")).toBeInTheDocument();

});

test("answer question incorrectly, update score", async () => {
    const {container} = render(<App />);

    await useBankCategories();

    const playersToAdd = ["Alice", "Bob"];
    addPlayers(playersToAdd);

    // Wait for grid to appear
    await screen.findByText((content) => content.includes("History"));

    const playersInOrder = getPlayerOrder(container);
    expect(playersInOrder.length).toBe(playersToAdd.length);
    for (let name of playersToAdd) {
        expect(playersInOrder).toContain(name);
    }

    // Click on History for 300 (row 2, col 0)
    const gridItems = screen.getAllByText("300");
    fireEvent.click(gridItems[0]);

    // Wait for question page
    await screen.findByText("Q3");

    // Select incorrect answer
    fireEvent.click(screen.getByText("B3"));

    // Should show "incorrect" and update score
    await screen.findByText(/incorrect/i);

    expectPlayerScore(playersInOrder[0], "-300");
    expectPlayerScore(playersInOrder[1], "0");

    expect(screen.getByText(playersInOrder[0]).closest(".scoreboard-cell--active")).toBeInTheDocument();

    // Back to grid
    fireEvent.click(screen.getByText(/Back to Grid/i));

    const seen200 = Array.from(document.querySelectorAll(".grid-item.seen"))
        .find(el => el.textContent.trim() === "300"); // Question is marked seen
    expect(seen200).toBeInTheDocument();

    expect(screen.getByText(playersInOrder[1]).closest(".scoreboard-cell--active")).toBeInTheDocument();
});

test("answer question, back to grid, game state persists after reload", async () => {
    const {container} = render(<App />);

    await useBankCategories();

    const playersToAdd = ["Alice", "Bob"];
    addPlayers(playersToAdd);
    // Wait for grid to appear
    await screen.findByText((content) => content.includes("History"));
    const playersInOrder = getPlayerOrder(container);
    expect(playersInOrder.length).toBe(playersToAdd.length);
    for (let name of playersToAdd) {
        expect(playersInOrder).toContain(name);
    }
    // Click on History for 300 (row 2, col 0)
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
    expect(screen.getByText(playersInOrder[0])).toBeInTheDocument();
    expect(screen.getByText(playersInOrder[1])).toBeInTheDocument();

    // Player 1's score should still be -300
    expectPlayerScore(playersInOrder[0], "-300");

    // Player 2's score should still be 0
    expectPlayerScore(playersInOrder[1], "0");

    // Player 2's turn now
    expect(screen.getByText(playersInOrder[1]).closest(".scoreboard-cell--active")).toBeInTheDocument();

    // The 300 question should still be marked as seen
    const seen300 = Array.from(document.querySelectorAll(".grid-item.seen"))
        .find(el => el.textContent.trim() === "300");
    expect(seen300).toBeInTheDocument();
});

test("refresh while on question page before answering question", async () => {
    const {container} = render(<App />);
    
    await useBankCategories();

    addPlayers(["Alice", "Bob"]);
    await screen.findByText((content) => content.includes("History"));

    const gridItems = screen.getAllByText("400");
    fireEvent.click(gridItems[0]);

    expect(screen.getByText("Q4")).toBeInTheDocument();

    await refreshPage();

    // Should still be on the question page
    expect(screen.getByText("Q4")).toBeInTheDocument();
});

test("refresh while on question page after answering question", async () => {
    const {container} = render(<App />);
    
    await useBankCategories();

    const playersToAdd = ["Alice", "Bob"];
    addPlayers(playersToAdd);
    await screen.findByText((content) => content.includes("History"));
    const playersInOrder = getPlayerOrder(container);
    const gridItems = screen.getAllByText("400");
    fireEvent.click(gridItems[0]);
    expect(screen.getByText("Q4")).toBeInTheDocument();
    fireEvent.click(screen.getByText("A4")); // correct answer

    // Should show "correct"
    await screen.findByText(/correct/i);
    // Player 1's score should be 400, still her turn
    expectPlayerScore(playersInOrder[0], "400");
    expect(screen.getByText(playersInOrder[0]).closest(".scoreboard-cell--active")).toBeInTheDocument();

    expect(screen.getByText("A4").closest(".option-correct")).toBeInTheDocument();

    expectPlayerScore(playersInOrder[1], "0");

    await refreshPage();

    // Should still be on the question page
    expect(screen.getByText("Q4")).toBeInTheDocument();
    // Should still show "correct"
    await screen.findByText(/correct/i);
    expect(screen.getByText("A4").closest(".option-correct")).toBeInTheDocument();

    // Player 1's score should be 400, still her turn
    expectPlayerScore(playersInOrder[0], "400");
    expect(screen.getByText(playersInOrder[0]).closest(".scoreboard-cell--active")).toBeInTheDocument();

    expectPlayerScore(playersInOrder[1], "0");

});

test("two players, two turns", async () => {
    const {container} = render(<App />);
    
    await useBankCategories();

    const playersToAdd = ["Alice", "Bob"];
    addPlayers(playersToAdd);

    await screen.findByText((content) => content.includes("History"));
    const playersInOrder = getPlayerOrder(container);

    const gridItems400 = screen.getAllByText("400");
    fireEvent.click(gridItems400[0]);
    expect(screen.getByText("Q4")).toBeInTheDocument();
    fireEvent.click(screen.getByText("C4")); // incorrect answer
    await screen.findByText(/incorrect/i);

    fireEvent.click(screen.getByText(/Back to Grid/i));
    expect(screen.getByText(playersInOrder[1]).closest(".scoreboard-cell--active")).toBeInTheDocument();
    const gridItems100 = screen.getAllByText("100");
    fireEvent.click(gridItems100[0]);
    expect(screen.getByText("Q1")).toBeInTheDocument();

    const feedback = screen.queryByText(/CORRECT|INCORRECT/i)
    expect(feedback).toBeNull()

    fireEvent.click(screen.getByText("B1")); // correct answer
    await screen.findByText(/correct/i);

    expectPlayerScore(playersInOrder[0], "-400");
    expectPlayerScore(playersInOrder[1], "100");

    fireEvent.click(screen.getByText(/Back to Grid/i));
    expect(screen.getByText(playersInOrder[0]).closest(".scoreboard-cell--active")).toBeInTheDocument();
});

test("three players", async () => {
    const {container} = render(<App />);
    
    await useBankCategories();

    const playersToAdd = ["Alice", "Bob", "Carlos"];
    addPlayers(playersToAdd);

    await screen.findByText((content) => content.includes("History"));

    const playersInOrder = getPlayerOrder(container);
    expect(playersInOrder.length).toBe(playersToAdd.length);
    for (let name of playersToAdd) {
        expect(playersInOrder).toContain(name);
    }

    const gridItems = screen.getAllByText("300");
    fireEvent.click(gridItems[0]);
    
    await screen.findByText("Q3");
    expect(screen.getByText(playersInOrder[0]).closest(".scoreboard-cell--active")).toBeInTheDocument();
    fireEvent.click(screen.getByText("D3")); // correct answer
    await screen.findByText(/correct/i);
    expectPlayerScore(playersInOrder[0], "300");
    expectPlayerScore(playersInOrder[1], "0");
    expectPlayerScore(playersInOrder[2], "0");
    
    fireEvent.click(screen.getByText(/Back to Grid/i));
    // Player 2's turn now
    expect(screen.getByText(playersInOrder[1]).closest(".scoreboard-cell--active")).toBeInTheDocument();

});

test("three players, four turns", async () => {
    const {container} = render(<App />);
    
    await useBankCategories();

    const playersToAdd = ["Alice", "Bob", "Carlos"];
    addPlayers(playersToAdd);

    await screen.findByText((content) => content.includes("History"));
    const playersInOrder = getPlayerOrder(container);

    const gridItems300 = screen.getAllByText("300");
    fireEvent.click(gridItems300[0]);
    
    await screen.findByText("Q3");
    expect(screen.getByText(playersInOrder[0]).closest(".scoreboard-cell--active")).toBeInTheDocument();
    fireEvent.click(screen.getByText("D3")); // correct answer
    await screen.findByText(/correct/i);
    fireEvent.click(screen.getByText(/Back to Grid/i));
    
    expect(screen.getByText(playersInOrder[1]).closest(".scoreboard-cell--active")).toBeInTheDocument(); // Bob's turn now
    const gridItems100 = screen.getAllByText("100");
    fireEvent.click(gridItems100[0]);

    await screen.findByText("Q1");
    fireEvent.click(screen.getByText("A1"));
    await screen.findByText(/incorrect/i);
    fireEvent.click(screen.getByText(/Back to Grid/i));

    expect(screen.getByText(playersInOrder[2]).closest(".scoreboard-cell--active")).toBeInTheDocument(); // Carlos's turn now
    const gridItems500 = screen.getAllByText("500");
    fireEvent.click(gridItems500[0]);

    await screen.findByText("Q5");
    fireEvent.click(screen.getByText("C5"));
    await screen.findByText(/correct/i);
    fireEvent.click(screen.getByText(/Back to Grid/i));

    expect(screen.getByText(playersInOrder[0]).closest(".scoreboard-cell--active")).toBeInTheDocument(); // Alice's turn now
    const gridItems400 = screen.getAllByText("400");
    fireEvent.click(gridItems400[0]);

    await screen.findByText("Q4");
    fireEvent.click(screen.getByText("A4"));
    await screen.findByText(/correct/i);
    fireEvent.click(screen.getByText(/Back to Grid/i));

    expect(screen.getByText(playersInOrder[1]).closest(".scoreboard-cell--active")).toBeInTheDocument(); // Bob's turn now
    expectPlayerScore(playersInOrder[0], "700");
    expectPlayerScore(playersInOrder[1], "-100");
    expectPlayerScore(playersInOrder[2], "500");
});