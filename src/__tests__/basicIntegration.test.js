import { React, act} from "react";
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
  addTwoPlayers();

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

  // Player 1's score should be 200, player 2's turn
  expect(screen.getByText(/Alice/)).toBeInTheDocument();
  const alice = screen.getByText(/Alice/);
  const aliceScore = alice.nextElementSibling.textContent.trim();
  expect(aliceScore).toBe("200");

  expect(screen.getByText(/Bob/)).toBeInTheDocument();
  const bob = screen.getByText(/Bob/);
  const bobScore = bob.nextElementSibling.textContent.trim();
  expect(bobScore).toBe("0");

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

  addTwoPlayers();

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

  expect(screen.getByText(/Alice/)).toBeInTheDocument();
  const alice = screen.getByText(/Alice/);
  const aliceScore = alice.nextElementSibling.textContent.trim();
  expect(aliceScore).toBe("-300");

  expect(screen.getByText(/Bob/)).toBeInTheDocument();
  const bob = screen.getByText(/Bob/);
  const bobScore = bob.nextElementSibling.textContent.trim();
  expect(bobScore).toBe("0");

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

  addTwoPlayers();
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

  // Unmount the app (simulating a page reload) and then remount it
  const { unmount } = render(<App />);
  unmount();
  cleanup();
  await act(() => {
    render(<App />);
  });

  // Check that the state is restored
  expect(screen.getByText(/Alice/)).toBeInTheDocument();
  expect(screen.getByText(/Bob/)).toBeInTheDocument();

  // Alice's score should still be -300
  const alice = screen.getByText(/Alice/);
  const aliceScore = alice.nextElementSibling.textContent.trim();
  expect(aliceScore).toBe("-300");

  // Bob's score should still be 0
  const bob = screen.getByText(/Bob/);
  const bobScore = bob.nextElementSibling.textContent.trim();
  expect(bobScore).toBe("0");

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

  addTwoPlayers();
  await screen.findByText((content) => content.includes("2000s Pop"));
  const gridItems = screen.getAllByText("400");
  fireEvent.click(gridItems[0]);

  expect(screen.getByText("Q4")).toBeInTheDocument();

  // Unmount the app (simulating a page reload) and then remount it
  const { unmount } = render(<App />);
  unmount();
  cleanup();
  await act(() => {
    render(<App />);
  });

  // Should still be on the question page
  expect(screen.getByText("Q4")).toBeInTheDocument();
});