import './App.css';
import AudiencePoll from './AudiencePoll';
import GridPage from './GridPage';
import Leaderboard from './Leaderboard';
import PlayerEntryPage from './PlayerEntryPage';
import QuestionPage from './QuestionPage';
import QuestionsSelectionPage from './QuestionsSelectionPage';
import { useEffect, useState } from "react";
import NavBar from './NavBar';
import { BrowserRouter as Router, Routes, Route } from "react-router";
import InstructionsPage from './InstructionsPage';

function App() {
    const numPointVals = 5; // points: 100 to 500

    const [headers, setHeaders] = useState(() => {
        const saved = localStorage.getItem("headers");
        return saved ? JSON.parse(saved) : [];
    });

    const [questions, setQuestions] = useState(() => {
        const saved = localStorage.getItem("questions");
        return saved ? JSON.parse(saved) : [];
    });

    const [players, setPlayers] = useState(() => {
        const saved = localStorage.getItem("players");
        return saved ? JSON.parse(saved) : [];
    });
    const [scores, setScores] = useState(() => {
        const saved = localStorage.getItem("scores");
        return saved ? JSON.parse(saved) : Array(players.length).fill(0);
    });
    const [currentPlayer, setCurrentPlayer] = useState(() => {
        const saved = localStorage.getItem("currentPlayer");
        return saved ? JSON.parse(saved) : 0;
    });
    const [seenQuestions, setSeenQuestions] = useState(() => {
        const saved = localStorage.getItem("seenQuestions");
        return saved ? JSON.parse(saved) : [];
    });

    const [view, setView] = useState(() => {
        const saved = localStorage.getItem("view");
        return saved ? JSON.parse(saved) : "questionEntry";
    });

    const [questionCoords, setQuestionCoords] = useState(() => {
        const saved = localStorage.getItem("questionCoords");
        return saved ? JSON.parse(saved) : { row: null, col: null };
    });

    const [selectedAnswers, setSelectedAnswers] = useState(() => { // selected answer index for each question
        const saved = localStorage.getItem("selectedAnswers");
        return saved ? JSON.parse(saved) : [];
    });
    const [feedbacks, setFeedbacks] = useState(() => { // feedbacks for each question
        const saved = localStorage.getItem("feedbacks");
        return saved ? JSON.parse(saved) : [];
    });

    const [lifelinesUsed, setLifelinesUsed] = useState(() => {
        const saved = localStorage.getItem("lifelinesUsed");
        return saved ? JSON.parse(saved) : [];
    });
    const [penalties, setPenalties] = useState(() => {
        const saved = localStorage.getItem("penalties");
        return saved ? JSON.parse(saved) : [];
    });

    const [audiencePollActive, setAudiencePollActive] = useState(() => {
        const saved = localStorage.getItem("audiencePollActive");
        return saved ? JSON.parse(saved) : false;
    });
    const [audiencePollIndex, setAudiencePollIndex] = useState(() => {
        const saved = localStorage.getItem("audiencePollIndex");
        return saved ? JSON.parse(saved) : 0;
    });
    const [audiencePollAnswers, setAudiencePollAnswers] = useState(() => {
        const saved = localStorage.getItem("audiencePollAnswers");
        return saved ? JSON.parse(saved) : Array(4).fill(0);
    });
    const [showHistogram, setShowHistogram] = useState(() => {
        const saved = localStorage.getItem("showHistogram");
        return saved ? JSON.parse(saved) : false;
    });

    useEffect(() => { // After questions load, populate seenQuestions, selectAnswer, feedbacks if empty
        if (headers.length > 0) {
            if (seenQuestions.length === 0) {
                // seenQuestions[row-1][col] gives whether question at (row, col) has been seen (row 0 is headers)
                const defaultSeen = Array.from({ length: numPointVals }, () => new Array(headers.length).fill(false));
                setSeenQuestions(defaultSeen);
            }
            if (selectedAnswers.length === 0) {
                // selectedAnswers[row-1][col] gives selected answer index for question at (row, col) if answered
                const defaultSelected = Array.from({ length: numPointVals }, () => new Array(headers.length).fill(null));
                setSelectedAnswers(defaultSelected);
            }
            if (feedbacks.length === 0) {
                // feedbacks[row-1][col] gives correctness feedback for question at (row, col) if answered
                const defaultFeedbacks = Array.from({ length: numPointVals }, () => new Array(headers.length).fill(""));
                setFeedbacks(defaultFeedbacks);
            }
        }
    }, [headers]);

    useEffect(() => {
        localStorage.setItem("questions", JSON.stringify(questions));
    }, [questions]);

    useEffect(() => {
        localStorage.setItem("headers", JSON.stringify(headers));
    }, [headers]);

    useEffect(() => {
        localStorage.setItem("players", JSON.stringify(players));
    }, [players]);

    useEffect(() => {
        localStorage.setItem("scores", JSON.stringify(scores));
    }, [scores]);

    useEffect(() => {
        localStorage.setItem("currentPlayer", JSON.stringify(currentPlayer));
    }, [currentPlayer]);
    
    useEffect(() => {
        localStorage.setItem("seenQuestions", JSON.stringify(seenQuestions));
    }, [seenQuestions]);

    useEffect(() => {
        localStorage.setItem("view", JSON.stringify(view));
    }, [view]);

    useEffect(() => {
        localStorage.setItem("questionCoords", JSON.stringify(questionCoords));
    }, [questionCoords]);

    useEffect(() => {
        localStorage.setItem("selectedAnswers", JSON.stringify(selectedAnswers));
    }, [selectedAnswers]);

    useEffect(() => {
        localStorage.setItem("feedbacks", JSON.stringify(feedbacks));
    }, [feedbacks]);

    useEffect(() => {
        localStorage.setItem("lifelinesUsed", JSON.stringify(lifelinesUsed));
    }, [lifelinesUsed]);

    useEffect(() => {
        localStorage.setItem("penalties", JSON.stringify(penalties));
    }, [penalties]);

    useEffect(() => {
        localStorage.setItem("audiencePollActive", JSON.stringify(audiencePollActive));
    }, [audiencePollActive]);
    
    useEffect(() => {
        localStorage.setItem("audiencePollIndex", JSON.stringify(audiencePollIndex));
    }, [audiencePollIndex]);

    useEffect(() => {
        localStorage.setItem("audiencePollAnswers", JSON.stringify(audiencePollAnswers));
    }, [audiencePollAnswers]);

    useEffect(() => {
        localStorage.setItem("showHistogram", JSON.stringify(showHistogram));
    }, [showHistogram]);

    // Decide which view to show based on state
    useEffect(() => {
        if (questions.length === 0) {
            setView("questionEntry");
        } else if (players.length === 0) {
            setView("playerEntry");
        } else if (audiencePollActive) {
            setView("audiencePoll");
        } else if (questionCoords.row !== null && questionCoords.col !== null) {
            setView("question");
        } else if (allQuestionsSeen()) {
            setView("leaderboard");
        } else {
            setView("grid");
        }
    }, [players, questionCoords, questions]);

    /**
     * Return true if all questions have been seen (game over),
     * false otherwise
     */
    const allQuestionsSeen = () => {
        for (let i=0; i < seenQuestions.length; i++) {
            for (let j=0; j<seenQuestions[i].length; j++) {
                if (seenQuestions[i][j] === false) {
                    return false;
                }
            }
        }
        return true;
    }

    const loadDefaultQuestions = async () => {
        const response = await fetch("/questions.json");
        const data = await response.json();
        setQuestions(data);
        const categoryNames = data.map(item => item.category);
        setHeaders(categoryNames);
    }

    const loadQuestions = (customQuestions) => { // customQuestions is parsed JSON object
        setQuestions(customQuestions);
        const categoryNames = customQuestions.map(item => item.category);
        setHeaders(categoryNames);
    }

    // Handlers to switch views
    const handleQuestionSelect = (row, col) => {
        const alreadySeen = seenQuestions[row - 1][col] // row 0 is headers
        if (alreadySeen) return;
        setQuestionCoords({ row, col });
        setView("question");
    };

    const handleQuestionClose = () => {
        // Mark this question seen
        if (questionCoords.row !== null && questionCoords.col !== null) {
            const updatedSeen = seenQuestions.map(row => [...row]);
            updatedSeen[questionCoords.row - 1][questionCoords.col] = true; // row 0 is headers
            setSeenQuestions(updatedSeen);
        }
        const nextPlayer = (currentPlayer + 1) % players.length;
        setCurrentPlayer(nextPlayer);
        setQuestionCoords({ row: null, col: null });

        setView("grid");
    };

    const handleAudiencePollStart = () => {
        setAudiencePollActive(true);
        setAudiencePollIndex(0);
        setAudiencePollAnswers(Array(4).fill(0));
        setView("audiencePoll");
    }

    const handleAudiencePollClose = () => {
        setAudiencePollActive(false);
        setAudiencePollIndex(0);
        setAudiencePollAnswers(Array(4).fill(0));
        setView("question");
    }

    const initializePlayers = (playerObjs) => {
        const playerNames = []
        const playerPenalties = []
        playerObjs.forEach(p => {
            playerNames.push(p.name);
            playerPenalties.push(p.penalty);
        });

        setPlayers(playerNames);
        setPenalties(playerPenalties);
        setScores(Array(playerObjs.length).fill(0));
        setCurrentPlayer(0);

        const defaultLifelines = [];
        playerObjs.forEach(() => {
            defaultLifelines.push({
                "50:50": false,
                "phone": false,
                "audience": false
            });
        });
        setLifelinesUsed(defaultLifelines);
    }

    const serveGamePage = (view) => {
        return (
            <div>
                {view === "questionEntry" && (
                    <QuestionsSelectionPage 
                        onQuestionsLoaded={loadQuestions} 
                        useDefaultQuestions={loadDefaultQuestions}
                    />
                )}
                {view === "playerEntry" && (
                    <PlayerEntryPage initializePlayers={initializePlayers} />
                )}
                {view === "grid" && (
                    <GridPage
                        rows={numPointVals + 1}
                        columns={headers.length}
                        headers={headers}
                        players={players}
                        scores={scores}
                        currentPlayer={currentPlayer}
                        onQuestionSelect={handleQuestionSelect}
                        seenQuestions={seenQuestions}
                    />
                )}
                {view === "question" && (
                    <QuestionPage
                        questions={questions}
                        scores={scores}
                        setScores={setScores}
                        currentPlayer={currentPlayer}
                        players={players}
                        row={questionCoords.row}
                        col={questionCoords.col}
                        onClose={handleQuestionClose}
                        selectedAnswers={selectedAnswers}
                        setSelectedAnswers={setSelectedAnswers}
                        feedbacks={feedbacks}
                        setFeedbacks={setFeedbacks}
                        lifelinesUsed={lifelinesUsed}
                        setLifelinesUsed={setLifelinesUsed}
                        penalties={penalties}
                        handleAskAudience={handleAudiencePollStart}
                    />
                )}
                {view === "audiencePoll" && (
                    <AudiencePoll
                        players={players}
                        currentPlayer={currentPlayer}
                        audiencePollIndex={audiencePollIndex}
                        setAudiencePollIndex={setAudiencePollIndex}
                        audiencePollAnswers={audiencePollAnswers}
                        setAudiencePollAnswers={setAudiencePollAnswers}
                        question={questions[questionCoords.col]?.questions?.[questionCoords.row-1].question}
                        validAnswer={localStorage.getItem("validAnswer") ? JSON.parse(localStorage.getItem("validAnswer")) : Array(4).fill(true)}
                        correctAnswer={questions[questionCoords.col]?.questions?.[questionCoords.row-1].answer.charCodeAt(0) - 65}
                        options={questions[questionCoords.col]?.questions?.[questionCoords.row-1].options}
                        onFinishPoll={handleAudiencePollClose}
                        showHistogram={showHistogram}
                        setShowHistogram={setShowHistogram}
                    />
                )}
                {view === "leaderboard" && (
                    <Leaderboard
                        players={players}
                        scores={scores}
                    />
                )}
            </div>
        );
    }

    return (
        <Router>
            <div>
                <NavBar />
                <Routes>
                    <Route path="/help" element={<InstructionsPage/>} />
                    <Route path="/" element={serveGamePage(view)} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
