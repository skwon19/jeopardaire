import { act} from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react"; 
import App from "../App";
import { addPlayers, refreshPage, expectPlayerScore } from "./basicIntegration.test.js";

test("Basic player entry", async () => {
    const {container} = render(<App />);
    await act(() => {
        fireEvent.click(screen.getByText(/Load Default Questions/i));
    });

    addPlayers(["Alice", "Bob", "Carlos"]);

    const players = container.getElementsByClassName("scoreboard-cell");
    expect(players.length).toBe(3);

    await screen.findByText(/Alice/i);
    await screen.findByText(/Bob/i);
    await screen.findByText(/Carlos/i);
});

test("Player names must be distinct", async () => {
    const {container} = render(<App />);
    await act(() => {
        fireEvent.click(screen.getByText(/Load Default Questions/i));
    });

    addPlayers(["Alice", "Bob", "Bob"]);

    expect(await screen.findByText(/Player names must be distinct./i)).toBeInTheDocument();

    const playerInputs = screen.getAllByPlaceholderText(/Player \d+/);
    fireEvent.change(playerInputs[2], { target: { value: "Devin" } });
    fireEvent.click(screen.getByText(/Start Game/i));

    const players = container.getElementsByClassName("scoreboard-cell");
    expect(players.length).toBe(3);

    await screen.findByText(/Alice/i);
    await screen.findByText(/Bob/i);
    await screen.findByText(/Devin/i);
});