import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react"; 
import App from "../App";
import { mockCategoryBank, addPlayers, refreshPage, expectPlayerScore, getPlayerOrder, useBankCategories } from "./testUtil.js";

beforeEach(() => {
    mockCategoryBank();
    localStorage.clear();
});

afterEach(() => {
    jest.restoreAllMocks();
});

test("50:50 works correctly", async () => {
    const {container} = render(<App />);
    
    await useBankCategories();
    addPlayers(["Alice", "Bob", "Carlos"]);

    await screen.findByText((content) => content.includes("History"));
    const playersInOrder = getPlayerOrder(container);

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
    expectPlayerScore(playersInOrder[0], "300");
    expectPlayerScore(playersInOrder[1], "0");
    expectPlayerScore(playersInOrder[2], "0");

    fireEvent.click(screen.getByText(/Back to Grid/i));
});

test("50:50 is per-player", async () => {
    const {container} = render(<App />);
    
    await useBankCategories();
    addPlayers(["Alice", "Bob", "Carlos"]);

    await screen.findByText((content) => content.includes("History"));
    const playersInOrder = getPlayerOrder(container);
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

    expect(screen.getByText(playersInOrder[1]).closest(".scoreboard-cell--active")).toBeInTheDocument();
    const gridItems500 = screen.getAllByText("500");
    fireEvent.click(gridItems500[0]);

    await screen.findByText("Q5");
    const lifelineButton2 = screen.getByText("50:50");

    expect(lifelineButton2).not.toHaveClass("used"); // Not used yet for Player 2
    
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
    expectPlayerScore(playersInOrder[0], "300");
    expectPlayerScore(playersInOrder[1], "-500");
    expectPlayerScore(playersInOrder[2], "0");
});

test("Lifeline 50:50 still used on next turn", async () => {
    const {container} = render(<App />);
    
    await useBankCategories();
    addPlayers(["Alice", "Bob"]);

    await screen.findByText((content) => content.includes("History"));
    const playersInOrder = getPlayerOrder(container);
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

    expect(screen.getByText(playersInOrder[1]).closest(".scoreboard-cell--active")).toBeInTheDocument();
    const gridItems500 = screen.getAllByText("500");
    fireEvent.click(gridItems500[0]);

    await screen.findByText("Q5");
    const lifelineButton2 = screen.getByText("50:50");

    expect(lifelineButton2).not.toHaveClass("used"); // Not used yet for Player 2

    const optionA = screen.getByText("A5");
    const optionB = screen.getByText("B5");
    const optionC = screen.getByText("C5");
    const optionD = screen.getByText("D5");

    for (const opt of [optionA, optionB, optionC, optionD]) {
        expect(opt).toHaveClass("option");
        expect(opt).not.toHaveClass("option-invalid");
    }

    fireEvent.click(optionC); // Answer correctly to end Player 2's turn
    await screen.findByText("CORRECT");
    expectPlayerScore(playersInOrder[0], "300");
    expectPlayerScore(playersInOrder[1], "500");
    fireEvent.click(screen.getByText(/Back to Grid/i));

    expect(screen.getByText(playersInOrder[0]).closest(".scoreboard-cell--active")).toBeInTheDocument();
    const gridItems200 = screen.getAllByText("200");
    fireEvent.click(gridItems200[0]);

    await screen.findByText("Q2");
    const lifelineButton3 = screen.getByText("50:50");

    expect(lifelineButton3).toHaveClass("used"); // Still used for Player 1
});

test("Lifeline 50:50 persists after page refresh", async () => {
    const {container} = render(<App />);
    
    await useBankCategories();
    addPlayers(["Alice", "Bob", "Carlos"]);

    await screen.findByText((content) => content.includes("History"));
    const playersInOrder = getPlayerOrder(container);
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
    expectPlayerScore(playersInOrder[0], "-300");
    expectPlayerScore(playersInOrder[1], "0");
    expectPlayerScore(playersInOrder[2], "0");

    fireEvent.click(screen.getByText(/Back to Grid/i));
});

test("Refreshing page after answering question doesn't undo used 50:50", async () => {
    const {container} = render(<App />);
    
    await useBankCategories();
    addPlayers(["Alice", "Bob", "Carlos"]);

    await screen.findByText((content) => content.includes("History"));
    const playersInOrder = getPlayerOrder(container);
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
    expectPlayerScore(playersInOrder[0], "300");
    expectPlayerScore(playersInOrder[1], "0");
    expectPlayerScore(playersInOrder[2], "0");

    fireEvent.click(screen.getByText(/Back to Grid/i));
});

test("Phone-a-friend (offline) works correctly", async () => {
    const {container} = render(<App />);
    
    await useBankCategories();
    addPlayers(["Alice", "Bob", "Carlos"]);

    await screen.findByText((content) => content.includes("History"));
    const playersInOrder = getPlayerOrder(container);
    const gridItems300 = screen.getAllByText("300");
    fireEvent.click(gridItems300[0]);

    await screen.findByText("Q3");
    const lifelineButton = screen.getByText("Phone a Friend (offline)");
    fireEvent.click(lifelineButton);

    await waitFor(() => { // Greyed out after 1 use
        expect(lifelineButton).toHaveClass("used");
    });

    // Answer the question
    fireEvent.click(screen.getByText("D3"));

    await screen.findByText("CORRECT");
    expectPlayerScore(playersInOrder[0], "300");
    expectPlayerScore(playersInOrder[1], "0");
    expectPlayerScore(playersInOrder[2], "0");

    fireEvent.click(screen.getByText(/Back to Grid/i));
});

test("Penalties are personal to each player", async () => {
    const {container} = render(<App />);
    
    await useBankCategories();
    const playerPenalties = new Map([
        ["Alice", "Penalty A"],
        ["Bob", "Penalty B"],
        ["Carlos", "Penalty C"]
    ]);
    addPlayers(["Alice", "Bob", "Carlos"], ["Penalty A", "Penalty B", "Penalty C"]);

    await screen.findByText((content) => content.includes("History"));
    const playersInOrder = getPlayerOrder(container);
    const gridItems100 = screen.getAllByText("100");
    fireEvent.click(gridItems100[0]);
    await screen.findByText("Q1");
    expect(screen.getByText(playerPenalties.get(playersInOrder[0]))).toBeInTheDocument();
    fireEvent.click(screen.getByText("A1"));
    fireEvent.click(screen.getByText(/Back to Grid/i));

    const gridItems200 = screen.getAllByText("200");
    fireEvent.click(gridItems200[0]);
    await screen.findByText("Q2");
    expect(screen.getByText(playerPenalties.get(playersInOrder[1]))).toBeInTheDocument();
    fireEvent.click(screen.getByText("A2"));
    fireEvent.click(screen.getByText(/Back to Grid/i));

    const gridItems300 = screen.getAllByText("300");
    fireEvent.click(gridItems300[0]);
    await screen.findByText("Q3");
    expect(screen.getByText(playerPenalties.get(playersInOrder[2]))).toBeInTheDocument();
    fireEvent.click(screen.getByText("A3"));
    fireEvent.click(screen.getByText(/Back to Grid/i));
});

test("Penalty lifeline works correctly", async () => {
    const {container} = render(<App />);
    
    await useBankCategories();
    const playerPenalties = new Map([
        ["Alice", "Penalty A"],
        ["Bob", "Penalty B"]
    ]);
    addPlayers(["Alice", "Bob"], ["Penalty A", "Penalty B"]);

    await screen.findByText((content) => content.includes("History"));
    const playersInOrder = getPlayerOrder(container);
    const gridItems100 = screen.getAllByText("100");
    fireEvent.click(gridItems100[0]);

    await screen.findByText("Q1");
    const lifelineButton = screen.getByText(playerPenalties.get(playersInOrder[0]));
    fireEvent.click(lifelineButton);

    const optionA = screen.getByText("A1");
    const optionB = screen.getByText("B1");
    const optionC = screen.getByText("C1");
    const optionD = screen.getByText("D1");
    await waitFor(() => {
        // Correct answer is B, so one of the other should be invalidated
        expect(optionB).toHaveClass("option");
        expect(optionB).not.toHaveClass("option-invalid");

        const options = [optionA, optionC, optionD];
        const invalidated = options.filter(opt => opt.classList.contains("option-invalid"));
        expect(invalidated.length).toBe(1);
        const validOptions = options.filter(opt => !opt.classList.contains("option-invalid"));
        expect(validOptions.length).toBe(2);
    });
    expect(lifelineButton).not.toHaveClass("used"); // Penalty can be used multiple times

    // Answer the question
    const validOptions = [optionA, optionC, optionD].filter(opt => !opt.classList.contains("option-invalid"));
    fireEvent.click(validOptions[0]);
    await screen.findByText(/incorrect/i);
    fireEvent.click(screen.getByText(/Back to Grid/i));

    expectPlayerScore(playersInOrder[0], "-100");
    expectPlayerScore(playersInOrder[1], "0");
});

test("Penalty lifeline works multiple times per turn", async() => {
    const {container} = render(<App />);
    
    await useBankCategories();
    const playerPenalties = new Map([
        ["Alice", "Penalty A"],
        ["Bob", "Penalty B"]
    ]);
    addPlayers(["Alice", "Bob"], ["Penalty A", "Penalty B"]);

    await screen.findByText((content) => content.includes("History"));
    const playersInOrder = getPlayerOrder(container);
    const gridItems100 = screen.getAllByText("100");
    fireEvent.click(gridItems100[0]);
    await screen.findByText("Q1"); // Correct answer is B1

    // First penalty use
    const lifelineButton = screen.getByText(playerPenalties.get(playersInOrder[0]));
    fireEvent.click(lifelineButton);

    const optionA = screen.getByText("A1");
    const optionB = screen.getByText("B1");
    const optionC = screen.getByText("C1");
    const optionD = screen.getByText("D1");
    const options = [optionA, optionB, optionC, optionD];
    await waitFor(() => {
        // One option should be invalidated
        const invalidated = options.filter(opt => opt.classList.contains("option-invalid"));
        expect(invalidated.length).toBe(1);
        const validOptions = options.filter(opt => !opt.classList.contains("option-invalid"));
        expect(validOptions.length).toBe(3);
        expect(invalidated).not.toContain(optionB);
    });
    expect(lifelineButton).not.toHaveClass("used");
    const invalidOptions1 = options.filter(opt => opt.classList.contains("option-invalid"));

    // Second penalty use
    fireEvent.click(lifelineButton);
    await waitFor(() => {
        // Two options should be invalidated
        const invalidated = options.filter(opt => opt.classList.contains("option-invalid"));
        expect(invalidated.length).toBe(2);
        const validOptions = options.filter(opt => !opt.classList.contains("option-invalid"));
        expect(validOptions.length).toBe(2);
        expect(invalidated).not.toContain(optionB);
    });
    expect(lifelineButton).not.toHaveClass("used");
    const invalidOptions2 = options.filter(opt => opt.classList.contains("option-invalid"));
    for (const invalidOpt of invalidOptions1) {
        expect(invalidOptions2).toContain(invalidOpt); // Previously invalidated should stay invalidated
    }

    // Third penalty use
    fireEvent.click(lifelineButton);
    await waitFor(() => {
        // Three options should be invalidated
        const invalidated = options.filter(opt => opt.classList.contains("option-invalid"));
        expect(invalidated.length).toBe(3);
        const validOptions = options.filter(opt => !opt.classList.contains("option-invalid"));
        expect(validOptions.length).toBe(1);
        expect(validOptions).toContain(optionB);
    });
    expect(lifelineButton).not.toHaveClass("used");
    fireEvent.click(optionB); // Answer correctly
    await screen.findByText(/correct/i);
    fireEvent.click(screen.getByText(/Back to Grid/i));

    expectPlayerScore(playersInOrder[0], "100");
    expectPlayerScore(playersInOrder[1], "0");
});

test("Use penalty then 50:50", async() => {
    const {container} = render(<App />);
    
    await useBankCategories();
    const playerPenalties = new Map([
        ["Alice", "Penalty A"],
        ["Bob", "Penalty B"]
    ]);
    addPlayers(["Alice", "Bob"], ["Penalty A", "Penalty B"]);

    await screen.findByText((content) => content.includes("History"));
    const playersInOrder = getPlayerOrder(container);
    const gridItems100 = screen.getAllByText("100");
    fireEvent.click(gridItems100[0]);
    await screen.findByText("Q1"); // Correct answer is B1

    // Use penalty
    const penaltyButton = screen.getByText(playerPenalties.get(playersInOrder[0]));
    fireEvent.click(penaltyButton);

    const optionA = screen.getByText("A1");
    const optionB = screen.getByText("B1");
    const optionC = screen.getByText("C1");
    const optionD = screen.getByText("D1");
    const options = [optionA, optionB, optionC, optionD];
    
    // One option should be invalidated
    await waitFor(() => {
        const invalidated1 = options.filter(opt => opt.classList.contains("option-invalid"));
        expect(invalidated1.length).toBe(1);
    });
    const validOptions1 = options.filter(opt => !opt.classList.contains("option-invalid"));
    expect(validOptions1.length).toBe(3);
    expect(validOptions1).toContain(optionB);
    
    // Use 50:50
    const fiftyButton = screen.getByText("50:50");
    fireEvent.click(fiftyButton);

    await waitFor(() => {
        expect(fiftyButton).toHaveClass("used");
    });

    const validOptions2 = options.filter(opt => !opt.classList.contains("option-invalid"));
    const invalidated2 = options.filter(opt => opt.classList.contains("option-invalid"));
    expect(invalidated2.length).toBe(3);
    expect(validOptions2.length).toBe(1);
    expect(validOptions2).toContain(optionB);

    fireEvent.click(optionB); // Answer correctly
    await screen.findByText(/correct/i);
    fireEvent.click(screen.getByText(/Back to Grid/i));

    expectPlayerScore(playersInOrder[0], "100");
    expectPlayerScore(playersInOrder[1], "0");
});

test("Use 50:50 then penalty", async() => {
    const {container} = render(<App />);
    
    await useBankCategories();
    const playerPenalties = new Map([
        ["Alice", "Penalty A"],
        ["Bob", "Penalty B"]
    ]);
    addPlayers(["Alice", "Bob"], ["Penalty A", "Penalty B"]);

    await screen.findByText((content) => content.includes("History"));
    const playersInOrder = getPlayerOrder(container);
    const gridItems100 = screen.getAllByText("100");
    fireEvent.click(gridItems100[0]);
    await screen.findByText("Q1"); // Correct answer is B1

    // Use 50:50
    const fiftyButton = screen.getByText("50:50");
    fireEvent.click(fiftyButton);
    
    const optionA = screen.getByText("A1");
    const optionB = screen.getByText("B1");
    const optionC = screen.getByText("C1");
    const optionD = screen.getByText("D1");
    const options = [optionA, optionB, optionC, optionD];

    await waitFor(() => {
        expect(fiftyButton).toHaveClass("used");
    });
    
    const invalidated1 = options.filter(opt => opt.classList.contains("option-invalid"));
    expect(invalidated1.length).toBe(2);
    const validOptions1 = options.filter(opt => !opt.classList.contains("option-invalid"));
    expect(validOptions1.length).toBe(2);
    expect(validOptions1).toContain(optionB);
    
    // Use penalty
    const penaltyButton = screen.getByText(playerPenalties.get(playersInOrder[0]));
    fireEvent.click(penaltyButton);

    // Three options should be invalidated
    await waitFor(() => {
        const invalidated1 = options.filter(opt => opt.classList.contains("option-invalid"));
        expect(invalidated1.length).toBe(3);
    });

    const validOptions2 = options.filter(opt => !opt.classList.contains("option-invalid"));
    expect(validOptions2.length).toBe(1);
    expect(validOptions2).toContain(optionB);

    fireEvent.click(optionB); // Answer correctly
    await screen.findByText(/correct/i);
    fireEvent.click(screen.getByText(/Back to Grid/i));

    expectPlayerScore(playersInOrder[0], "100");
    expectPlayerScore(playersInOrder[1], "0");
});

test("Ask the audience lifeline", async() => {
    const {container} = render(<App />);
    
    await useBankCategories();
    addPlayers(["Alice", "Bob", "Carlos"]);

    await screen.findByText((content) => content.includes("History"));
    const playersInOrder = getPlayerOrder(container);

    const gridItems300 = screen.getAllByText("300");
    fireEvent.click(gridItems300[0]);

    await screen.findByText("Q3");
    let lifelineButton = screen.getByText(/Ask the Audience/i);
    fireEvent.click(lifelineButton);

    // Expect AudiencePoll page for player 2
    await screen.findByText(playersInOrder[1]);
    await screen.findByText(/please answer to the best of your ability/i);
    await screen.findByText("Q3");
    fireEvent.click(screen.getByText("A3"));

    // Expect AudiencePoll page for player 3
    await screen.findByText(playersInOrder[2]);
    await screen.findByText(/please answer to the best of your ability/i);
    await screen.findByText("Q3");
    fireEvent.click(screen.getByText("D3"));

    // Expect histogram of results
    await screen.findByText(/Ask the Audience Results/i);
    const barsDiv = container.getElementsByClassName("audience-histogram-bars")[0];
    const bars = Array.from(barsDiv.children);
    expect(bars.length).toBe(4);
    for (let i = 0; i < bars.length; i++) {
        let bar = bars[i];
        let label = bar.getElementsByClassName("audience-histogram-label")[0];
        expect(label).toBeInTheDocument();
        expect(label.textContent).toBe(String.fromCharCode(65 + i));
        let count = bar.getElementsByClassName("audience-histogram-count")[0];
        expect(count).toBeInTheDocument();
        if (label.textContent === "A") {
            expect(count.textContent).toBe("1");
        } else if (label.textContent === "D") {
            expect(count.textContent).toBe("1");
        } else {
            expect(count.textContent).toBe("0");
        }
    }

    fireEvent.click(screen.getByText(/Close Poll/i));
    await screen.findByText("Q3");
    lifelineButton = screen.getByText(/Ask the Audience/i);
    await waitFor(() => { // Greyed out after 1 use
        expect(lifelineButton).toHaveClass("used");
    });

    fireEvent.click(screen.getByText("A3"));
    await screen.findByText("INCORRECT");
    fireEvent.click(screen.getByText(/Back to Grid/i));
});

test("Ask the audience, refresh during 2nd person's poll", async() => {
    const {container} = render(<App />);
    
    await useBankCategories();
    addPlayers(["Alice", "Bob", "Carlos"]);

    await screen.findByText((content) => content.includes("History"));
    const playersInOrder = getPlayerOrder(container);

    const gridItems300 = screen.getAllByText("300");
    fireEvent.click(gridItems300[0]);

    await screen.findByText("Q3");
    let lifelineButton = screen.getByText(/Ask the Audience/i);
    fireEvent.click(lifelineButton);

    // Expect AudiencePoll page for player 2
    await screen.findByText(playersInOrder[1]);
    await screen.findByText(/please answer to the best of your ability/i);
    await screen.findByText("Q3");
    fireEvent.click(screen.getByText("A3"));

    // Expect AudiencePoll page for player 3
    await screen.findByText(playersInOrder[2]);
    await screen.findByText(/please answer to the best of your ability/i);
    await screen.findByText("Q3");
    await refreshPage();

    await screen.findByText(playersInOrder[2]);
    await screen.findByText(/please answer to the best of your ability/i);
    await screen.findByText("Q3");
    fireEvent.click(screen.getByText("D3"));

    // Expect histogram of results
    await screen.findByText(/Ask the Audience Results/i);
    const barsDiv = document.getElementsByClassName("audience-histogram-bars")[0];
    const bars = Array.from(barsDiv.children);
    expect(bars.length).toBe(4);
    for (let i = 0; i < bars.length; i++) {
        let bar = bars[i];
        let label = bar.getElementsByClassName("audience-histogram-label")[0];
        expect(label).toBeInTheDocument();
        expect(label.textContent).toBe(String.fromCharCode(65 + i));
        let count = bar.getElementsByClassName("audience-histogram-count")[0];
        expect(count).toBeInTheDocument();
        if (label.textContent === "A") {
            expect(count.textContent).toBe("1");
        } else if (label.textContent === "D") {
            expect(count.textContent).toBe("1");
        } else {
            expect(count.textContent).toBe("0");
        }
    }

    fireEvent.click(screen.getByText(/Close Poll/i));
    await screen.findByText("Q3");
    lifelineButton = screen.getByText(/Ask the Audience/i);
    await waitFor(() => { // Greyed out after 1 use
        expect(lifelineButton).toHaveClass("used");
    });

    fireEvent.click(screen.getByText("A3"));
    await screen.findByText("INCORRECT");
    fireEvent.click(screen.getByText(/Back to Grid/i));
});

test("Ask the audience, refresh during histogram", async() => {
    const {container} = render(<App />);
    
    await useBankCategories();
    addPlayers(["Alice", "Bob", "Carlos"]);

    await screen.findByText((content) => content.includes("History"));
    const playersInOrder = getPlayerOrder(container);

    const gridItems300 = screen.getAllByText("300");
    fireEvent.click(gridItems300[0]);

    await screen.findByText("Q3");
    let lifelineButton = screen.getByText(/Ask the Audience/i);
    fireEvent.click(lifelineButton);

    // Expect AudiencePoll page for player 2
    await screen.findByText(playersInOrder[1]);
    await screen.findByText(/please answer to the best of your ability/i);
    await screen.findByText("Q3");
    fireEvent.click(screen.getByText("A3"));

    // Expect AudiencePoll page for player 3
    await screen.findByText(playersInOrder[2]);
    await screen.findByText(/please answer to the best of your ability/i);
    await screen.findByText("Q3");
    fireEvent.click(screen.getByText("D3"));

    // Expect histogram of results
    await screen.findByText(/Ask the Audience Results/i);
    let barsDiv = document.getElementsByClassName("audience-histogram-bars")[0];
    let bars = Array.from(barsDiv.children);
    expect(bars.length).toBe(4);
    for (let i = 0; i < bars.length; i++) {
        let bar = bars[i];
        let label = bar.getElementsByClassName("audience-histogram-label")[0];
        expect(label).toBeInTheDocument();
        expect(label.textContent).toBe(String.fromCharCode(65 + i));
        let count = bar.getElementsByClassName("audience-histogram-count")[0];
        expect(count).toBeInTheDocument();
        if (label.textContent === "A") {
            expect(count.textContent).toBe("1");
        } else if (label.textContent === "D") {
            expect(count.textContent).toBe("1");
        } else {
            expect(count.textContent).toBe("0");
        }
    }

    await refreshPage();

    await screen.findByText(/Ask the Audience Results/i);
    barsDiv = document.getElementsByClassName("audience-histogram-bars")[0];
    bars = Array.from(barsDiv.children);
    expect(bars.length).toBe(4);
    for (let i = 0; i < bars.length; i++) {
        let bar = bars[i];
        let label = bar.getElementsByClassName("audience-histogram-label")[0];
        expect(label).toBeInTheDocument();
        expect(label.textContent).toBe(String.fromCharCode(65 + i));
        let count = bar.getElementsByClassName("audience-histogram-count")[0];
        expect(count).toBeInTheDocument();
        if (label.textContent === "A") {
            expect(count.textContent).toBe("1");
        } else if (label.textContent === "D") {
            expect(count.textContent).toBe("1");
        } else {
            expect(count.textContent).toBe("0");
        }
    }

    fireEvent.click(screen.getByText(/Close Poll/i));
    await screen.findByText("Q3");
    lifelineButton = screen.getByText(/Ask the Audience/i);
    await waitFor(() => { // Greyed out after 1 use
        expect(lifelineButton).toHaveClass("used");
    });

    fireEvent.click(screen.getByText("A3"));
    await screen.findByText("INCORRECT");
    fireEvent.click(screen.getByText(/Back to Grid/i));
});

test("Clicking on answers when histogram is displayed does not change anything", async() => {
    const {container} = render(<App />);
    
    await useBankCategories();
    addPlayers(["Alice", "Bob", "Carlos"]);

    await screen.findByText((content) => content.includes("History"));
    const playersInOrder = getPlayerOrder(container);

    const gridItems300 = screen.getAllByText("300");
    fireEvent.click(gridItems300[0]);

    await screen.findByText("Q3");
    let lifelineButton = screen.getByText(/Ask the Audience/i);
    fireEvent.click(lifelineButton);

    // Expect AudiencePoll page for player 2
    await screen.findByText(playersInOrder[1]);
    await screen.findByText(/please answer to the best of your ability/i);
    await screen.findByText("Q3");
    fireEvent.click(screen.getByText("A3"));

    // Expect AudiencePoll page for player 3
    await screen.findByText(playersInOrder[2]);
    await screen.findByText(/please answer to the best of your ability/i);
    await screen.findByText("Q3");
    fireEvent.click(screen.getByText("D3"));

    // Expect histogram of results
    await screen.findByText(/Ask the Audience Results/i);
    const barsDiv = container.getElementsByClassName("audience-histogram-bars")[0];
    const bars = Array.from(barsDiv.children);
    expect(bars.length).toBe(4);
    for (let i = 0; i < bars.length; i++) {
        let bar = bars[i];
        let label = bar.getElementsByClassName("audience-histogram-label")[0];
        expect(label).toBeInTheDocument();
        expect(label.textContent).toBe(String.fromCharCode(65 + i));
        let count = bar.getElementsByClassName("audience-histogram-count")[0];
        expect(count).toBeInTheDocument();
        if (label.textContent === "A") {
            expect(count.textContent).toBe("1");
        } else if (label.textContent === "D") {
            expect(count.textContent).toBe("1");
        } else {
            expect(count.textContent).toBe("0");
        }
    }

    fireEvent.click(screen.getByText("A3")); // Clicking answers should do nothing
    
    // Histogram should still be displayed unchanged
    expect(bars.length).toBe(4);
    for (let i = 0; i < bars.length; i++) {
        let bar = bars[i];
        let label = bar.getElementsByClassName("audience-histogram-label")[0];
        expect(label).toBeInTheDocument();
        expect(label.textContent).toBe(String.fromCharCode(65 + i));
        let count = bar.getElementsByClassName("audience-histogram-count")[0];
        expect(count).toBeInTheDocument();
        if (label.textContent === "A") {
            expect(count.textContent).toBe("1");
        } else if (label.textContent === "D") {
            expect(count.textContent).toBe("1");
        } else {
            expect(count.textContent).toBe("0");
        }
    }

    fireEvent.click(screen.getByText(/Close Poll/i));
    await screen.findByText("Q3");
    lifelineButton = screen.getByText(/Ask the Audience/i);
    await waitFor(() => { // Greyed out after 1 use
        expect(lifelineButton).toHaveClass("used");
    });

    fireEvent.click(screen.getByText("A3"));
    await screen.findByText("INCORRECT");
    fireEvent.click(screen.getByText(/Back to Grid/i));
});