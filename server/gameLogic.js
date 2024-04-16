class GameLogic {
    constructor(dictionary, wordsTotalNum, wordsHighlightedNum, wordsToSelectNum) {
        this.dictionary = dictionary;
        this.wordsTotalNum = wordsTotalNum;
        this.wordsHighlightedNum = wordsHighlightedNum;
        this.wordsToSelectNum = wordsToSelectNum;
        this.selections = {};
        this.masterSelector = null;
        this.submittedPlayers = [];
    }

    initializeGameState() {
        // Shuffling and selecting a subset of words from the full dictionary
        const shuffled = [...this.dictionary].sort(() => 0.5 - Math.random()); // Use spread to avoid mutating the original array
        const selectedWords = shuffled.slice(0, this.wordsTotalNum);
        return {
            wordsTotal: selectedWords,
            wordsHighlighted: selectedWords.slice(0, this.wordsHighlightedNum),
            masterSelectorId: this.masterSelector, // To be set later externally
        };
    }

    addSelection(playerId, playerName, selectedWords) {
        console.log("Current state of submittedPlayers:", this.submittedPlayers); // Debugging line
        const isAlreadySubmitted = this.submittedPlayers.find((p) => p.id === playerId);
        if (!isAlreadySubmitted) {
            this.selections[playerId] = selectedWords;
            this.submittedPlayers.push({ id: playerId, name: playerName }); // Store both ID and name
            return this.checkAllSelections();
        }
        return null; // Return null if already submitted to prevent re-submission
    }

    checkAllSelections() {
        // Check if all players (except the master) have made their selections
        const numberOfPlayers = Object.keys(this.selections).length;
        const neededSelections = this.wordsTotalNum - 1; // Assuming master does not need to make a selection
        if (numberOfPlayers === neededSelections) {
            return this.calculateScores();
        }
        return null;
    }

    calculateScores() {
        let teamScore = 0;
        const masterChoices = this.selections[this.masterSelector];
        const totalPossible = this.wordsToSelectNum * (Object.keys(this.selections).length - 1);

        Object.values(this.selections).forEach((selection) => {
            if (selection.playerId !== this.masterSelector) {
                selection.forEach((word) => {
                    if (masterChoices.includes(word)) teamScore += 1;
                });
            }
        });

        const normalizedScore = Math.ceil((teamScore / totalPossible) * 10);
        return {
            teamScore: normalizedScore,
            individualScores: this.calculateIndividualScores(masterChoices, normalizedScore),
        };
    }

    calculateIndividualScores(masterChoices, teamScore) {
        const scores = {};
        Object.values(this.selections).forEach((selection) => {
            const score = selection.reduce((acc, word) => acc + (masterChoices.includes(word) ? 1 : 0), 0);
            const playerId = selection.playerId;
            scores[playerId] = playerId === this.masterSelector ? teamScore : Math.ceil((score / this.wordsToSelectNum) * 10);
        });
        return scores;
    }
}

module.exports = GameLogic;
