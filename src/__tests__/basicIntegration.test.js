import { React, act} from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react"; 
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

test("fetch mock works", async () => {
  const response = await fetch("/questions.json");
  const data = await response.json();
  expect(data[0].category).toBe("2000s Pop");
});

test("full game flow: add players, answer question, update score, and grid updates", async () => {
  await act(() => {
    render(<App />);
  });

  // Add two players
  const playerInputs = screen.getAllByPlaceholderText(/Player \d+/);
  fireEvent.change(playerInputs[0], { target: { value: "Alice" } });
  fireEvent.change(playerInputs[1], { target: { value: "Bob" } });

  fireEvent.click(screen.getByText(/Start Game/i));

  // Wait for grid to appear
  // await new Promise((r) => setTimeout(r, 1000));
  // await screen.findByText(/2000s Pop/i);
  await screen.findByText((content) => content.includes("2000s Pop"));

  // Click on Nerd Stuff for 200 (row 2, col 0)
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