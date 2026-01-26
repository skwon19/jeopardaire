<!-- # Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify) -->

# Welcome to Jeopardaire!

Test your knowledge against your friends in **Jeopardaire**! A cross between the popular shows *Jeopardy!* and *Who Wants to Be a Millionaire?*, Jeopardaire is a fun trivia game to play in a group. Jeopardaire is best for 2-8 players and should be played on a screen big enough for all players to see.

First, pick your categories. You can either select from the bank of preset questions, or upload a JSON file with your own custom questions. (Coming soon: AI-generated questions)

Next, enter the players' names. Each player must also enter a “penalty” action, something that is somewhat difficult but can be done repeatedly, e.g. “Do 10 push-ups,” “Eat a spicy pepper,” “Tell a secret about yourself.” On your turn, you may always perform your penalty in order to remove an incorrect answer choice (more details under “lifelines” below).

At the beginning of each turn, the current player's name is highlighted on the scoreboard at the bottom of the screen. The player must pick a question by clicking on a point value (100 to 500) on the grid. The question, along with four answer choices, is displayed onscreen. If the player answers correctly, they obtain points equal to the question's value. If they answer incorrectly, those points are subtracted from their score.

Before answering a question, a player may choose to use one or more “*lifelines*.” The lifelines are as follows:

*50:50* Two incorrect answers are eliminated, leaving the player with a choice between the correct answer and one remaining incorrect answer.

*Phone a Friend* The player may ask a friend (offline) to answer the question to their best knowledge. (The friend may not use the internet or other reference materials.)

*Ask the Audience* Each member of the “audience” (i.e. the other players) will be asked to answer the question to their best knowledge (not using internet or other reference materials). The current player will be shown the tally of how many people selected each answer (but not who selected what).

*Penalty* Perform your penalty action. In exchange, one incorrect answer is eliminated.
Each player only gets one use of each lifeline during the game, so use them wisely! The exception is the penalty action, which may be used an unlimited number of times per game or even multiple times in one turn.

Once all the questions in the grid have been answered, the player with the most points wins!