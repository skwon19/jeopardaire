import './InstructionsPage.css';

const InstructionsPage = () => {
    return (
        <div>
            <p>
                Test your knowledge against your friends in Jeopardaire! 
                A cross between the popular shows <cite>Jeopardy!</cite> and <cite>Who Wants to Be a Millionaire?</cite>, 
                Jeopardaire is a fun trivia game to play in a group. 
                Jeopardaire is best for 2-8 players and should be played on a screen big enough for all players to see.
            </p>
            <p>
                First, pick your categories. You can either select from the bank of preset questions, 
                or upload a JSON file with your own custom questions. (Coming soon: AI-generated questions)
            </p>
            <p>
                Next, enter the players' names. Each player must also enter a “penalty” action, 
                something that is somewhat difficult but able to be done repeatedly, 
                e.g. “Do 10 push-ups,” “Eat a spicy pepper,” “Tell a secret about yourself.” 
                On your turn, you may always perform your penalty in order to remove an incorrect answer choice 
                (more details under “lifelines” below).
            </p>
            <p>
                At the beginning of each turn, the current player's name is highlighted on the scoreboard at the bottom 
                of the screen. The player must pick a question by clicking on a point value (100 to 500) on the grid. 
                The question, along with four answer choices, is displayed onscreen. If the player answers correctly, 
                they obtain points equal to the question's value. If they answer incorrectly, those points are subtracted 
                from their score.
            </p>
            <p>
                Before answering a question, a player may choose to use one or more “lifelines.” 
                The lifelines are as follows:
                <ul>
                    <li>
                        <em>50:50</em> Two incorrect answers are eliminated, leaving the player with a choice between 
                        the correct answer and one remaining incorrect answer.
                    </li>
                    <li>
                        <em>Phone a Friend</em> The player may ask a friend (offline) to answer the question to their 
                        best knowledge. (The friend may not use the internet or other reference materials.)
                    </li>
                    <li>
                        <em>Ask the Audience</em> Each member of the “audience” (i.e. the other players) will be asked 
                        to answer the question to their best knowledge (not using internet or other reference materials). 
                        The current player will be shown the tally of how many people selected each answer 
                        (but not who selected what).
                    </li>
                    <li>
                        <em>Penalty</em> Perform your penalty action. In exchange, one incorrect answer is eliminated.
                    </li>
                </ul>
                Each player only gets one use of each lifeline during the game, so use them wisely! 
                The exception is the penalty action, which may be used an unlimited number of times per game or even 
                multiple times in one turn.
            </p>
            <p>
                Once all the questions in the grid have been answered, the player with the most points wins!
            </p>
        </div>
    );
}

export default InstructionsPage;