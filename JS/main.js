let isTouchScreenDevice = ("ontouchstart" in window) || ("onmsgesturechange" in window);

function customAlert(title, text) {
    document.getElementsByClassName("alert__box__header__title")[0].innerHTML = title;
    document.getElementsByClassName("alert__box__text")[0].innerHTML = text;
    document.getElementsByClassName("alert")[0].classList.add("alert--show");
};

let gameContainer;
let scoreArea;
let timeScore;
let timeScoreHrs;
let timeScoreMins;
let timeScoreSecs;
let timeScoreTime;
let timeStart;
let timeScoreTimer;
let timeScoreArea;
let difficultyScoreArea;
let movesScore = 0;
let movesScoreArea;
let pointsScore = 0;
let pointsScoreArea;
let gameArea;
let initialClickCount = 0;
let resetDeckButtonSrc;
let resetDeckButton;
let buttonsArea;
let playButton;
let instructionsButton;
let hardButton;
let mediumButton;
let easyButton;
let buttonTransition;
let windowScrollLeft;
let windowScrollTop;
let GAME_TYPES = {
    Easy: 1,
    Medium: 2,
    Hard: 3
};
let defaultDifficulty = GAME_TYPES.Hard
let GAME_DIFFICULTY = defaultDifficulty;
let gameLoaded = false;
let gameStarted = false;
let gameFinished = false;
let autoCompleteTime = 400;
let deckDealTimer = undefined;
let deckCardDealTime = 180;
let deckFaceUpCards = 0;
let deckMargin = 0.35;
let deckPadding = 0.33;
let numberOfFoundations = 4;
let foundationSrc;
let foundationAreaWidth = 0.55;
let foundationY;
let topMargin;
let numberOfTableax = 7;
let gameAreaBoundaries;
let dropBuffer;
let movingCards = [];
let foundations = [];
let tableauMaxCardPadding;
let tableauTop;
let tableaux = [];
let isDeckDraggable;

gameContainer = $("#solitaireGame");

// Score
scoreArea = gameContainer.find(".gameHUDArea");
timeScoreArea = scoreArea.find(".solitaireGameScoreTime");
difficultyScoreArea = scoreArea.find(".solitaireGameScoreDifficulty");
movesScoreArea = scoreArea.find(".solitaireGameScoreMoves");
pointsScoreArea = scoreArea.find(".solitaireGameScorePoints");

// Play
gameArea = gameContainer.find(".gameArea");
resetDeckButtonSrc = "IMAGES/resetDeck.png";
gameArea.append("<img class=\"card\" src=\"" + resetDeckButtonSrc + "\" draggable=false>");
resetDeckButton = gameArea.find("img[src$=\"" + resetDeckButtonSrc + "\"]");
resetDeckButton.css("z-index", 0);

// Buttons
buttonsArea = gameContainer.find(".gameButtonsArea");
playButton = buttonsArea.find(".gameButtonsPlay");
instructionsButton = buttonsArea.find(".gameButtonsInstructions");
hardButton = buttonsArea.find(".gameButtonsHard");
mediumButton = buttonsArea.find(".gameButtonsMedium");
easyButton = buttonsArea.find(".gameButtonsEasy");
hardButton.remove()
mediumButton.remove()
easyButton.remove()
playButton.on("click", function (event) {
    playButtonClicked();
});
instructionsButton.on("click", function (event) {
    let xhr_instructions = new XMLHttpRequest();
    xhr_instructions.open("GET", "COMPONENTS/solitaireInstructions.txt", true);
    xhr_instructions.onreadystatechange = function () {
        if (xhr_instructions.readyState == 4 && xhr_instructions.status == 200) {
            customAlert("Instructions", xhr_instructions.responseText);
        }
    };
    xhr_instructions.send(null);
});
hardButton.on("click", function (event) {
    GAME_DIFFICULTY = GAME_TYPES.Hard;
    hideDifficultyButtons();
    startGame();
});
mediumButton.on("click", function (event) {
    GAME_DIFFICULTY = GAME_TYPES.Medium;
    hideDifficultyButtons();
    startGame();
});
easyButton.on("click", function (event) {
    GAME_DIFFICULTY = GAME_TYPES.Easy;
    hideDifficultyButtons();
    startGame();
});


buttonTransition = playButton.css("transition-duration")
buttonTransition = parseFloat(buttonTransition.substr(0, buttonTransition.length - 1)) * 1000

function setTimeScore(change) {
    timeScore = Math.floor((new Date().getTime() - timeStart) / 1000);
    timeScoreHrs = (Math.floor(timeScore / 60 / 60) % 24);
    timeScoreMins = ("0" + (Math.floor(timeScore / 60) % 60)).slice(-2);
    timeScoreSecs = ("0" + (timeScore % 60)).slice(-2);
    if (timeScoreHrs.toString().length < 2) timeScoreHrs = "0" + timeScoreHrs;
    timeScoreTime = timeScoreHrs + ":" + timeScoreMins + ":" + timeScoreSecs;
    timeScoreArea.text("Time: " + timeScoreTime);

    if ((timeScoreSecs % 10) == 0) setPointsScore(-2);
}

function setMovesScore() {
    movesScore++;
    movesScoreArea.text("Moves: " + movesScore);
}

function setPointsScore(change) {
    if (gameFinished) return;
    pointsScore += change;
    if (pointsScore < 0) pointsScore = 0;
    pointsScoreArea.text("Score: " + pointsScore);
}

function initialClick() {
    initialClickCount++;
    switch (initialClickCount) {
        case 1:
            playButtonClicked();
            break;
        case 2:
            hideDifficultyButtons();
            GAME_DIFFICULTY = defaultDifficulty;
            startGame();
            break;
        default:
            break;
    }
}

function playButtonClicked() {
    initialClickCount = 1
    playButton.removeClass("gameButtonsVisible")
    instructionsButton.removeClass("gameButtonsVisible")
    setTimeout(() => {
        playButton.remove();
        instructionsButton.remove();
        showDifficultyButtons();
    }, buttonTransition)
}

function showDifficultyButtons() {
    hardButton.appendTo(buttonsArea);
    mediumButton.appendTo(buttonsArea);
    easyButton.appendTo(buttonsArea);
    hardButton[0].offsetHeight
    hardButton.addClass("gameButtonsVisible")
    mediumButton.addClass("gameButtonsVisible")
    easyButton.addClass("gameButtonsVisible")
}

function hideDifficultyButtons() {
    hardButton.remove();
    mediumButton.remove();
    easyButton.remove();
    buttonsArea.css("opacity", "0")
}

function startGame() {
    calculateSizes();
    difficultyScoreArea.text("Difficulty: ");
    switch (GAME_DIFFICULTY) {
        case GAME_TYPES.Easy:
            difficultyScoreArea.text(difficultyScoreArea.text() + "Easy");
            break;
        case GAME_TYPES.Medium:
            difficultyScoreArea.text(difficultyScoreArea.text() + "Medium");
            break;
        case GAME_TYPES.Hard:
            difficultyScoreArea.text(difficultyScoreArea.text() + "Hard");
            break;
        default:
            break;
    }
    handDealCards();
    gameStarted = true;
    scoreArea.css("opacity", "1");
    timeStart = new Date().getTime();
    setTimeScore();
    movesScore--;
    setMovesScore();
    setPointsScore(0);
    timeScoreTimer = setInterval(() => setTimeScore(1), 1000);
}

function gameOver() {
    customAlert("You won!", "You took " + timeScoreTime + "\n\nRestart to play again");
}

scoreArea.css("opacity", "0");
generateCards(gameArea);

// Deck
function handDealCards() {
    for (let i = 0; i < tableaux.length; i++) {
        for (let j = i; j < tableaux.length; j++) {
            let cardID = DECK.cardIDs[DECK.cardIDs.length - 1];
            tableaux[j].addCard(cardID, i);
            DECK.removeCard(cardID);
            if (j == i) {
                CARD_OBJECTS[cardID].turnFaceUp(function (currentCardID) {
                    CARD_OBJECTS[currentCardID].cardImage.attr("draggable", true);
                    setTableauCardZindex(currentCardID);
                });
            }
        }
    }
}

function getDeckCardPosX(cardNum) {
    return DECK.x + (cardImageSize.width * (1 + deckMargin + (deckPadding * cardNum)))
}

function removeCardFromDeck(cardID) {
    cardID = parseInt(cardID);
    for (let j = 1; j <= GAME_DIFFICULTY; j++) {
        let prevCardID = DECK.cardIDs[DECK.cardIDs.indexOf(cardID) + j];
        if (prevCardID != undefined) {
            CARD_OBJECTS[prevCardID].cardImage.css("z-index", parseInt(CARD_OBJECTS[prevCardID].cardImage.css("z-index")) + 1);
            if (j < GAME_DIFFICULTY) {
                CARD_OBJECTS[prevCardID].lastPosX = getDeckCardPosX(GAME_DIFFICULTY - 1 - j + 1);
                moveCardToLastPos(prevCardID, cardMoveTime);
            } else {
                let prevPrevCardID = DECK.cardIDs[DECK.cardIDs.indexOf(prevCardID) + 1];
                if (prevPrevCardID != undefined)
                    CARD_OBJECTS[prevPrevCardID].cardImage.css("z-index", 1);
            }
        }
    }
    DECK.removeCard(cardID);
    deckFaceUpCards--;
    if (deckFaceUpCards > 0)
        CARD_OBJECTS[DECK.cardIDs[DECK.cardIDs.length - 1 - (deckFaceUpCards - 1)]].cardImage.attr("draggable", true);
}

function isFromDeck(cardID) {
    let result = false;
    let dropWidth = getDeckCardPosX(GAME_DIFFICULTY - 1) - getDeckCardPosX(0);
    if (isInPos({
        x: CARD_OBJECTS[cardID].lastPosX,
        y: CARD_OBJECTS[cardID].lastPosY
    }, {
        x: getDeckCardPosX(0) + (dropWidth / 2),
        y: DECK.y
    }, {
        x: (dropWidth / 2) + 0.1,
        y: 0.1
    })) {
        removeCardFromDeck(cardID);
        result = true;
    }
    return result
}

function isDeckDealOnLastCard(cardID) {
    let prevCardID = DECK.cardIDs[DECK.cardIDs.indexOf(cardID) + 1];
    if ((prevCardID != undefined) && isInPos({
        x: CARD_OBJECTS[cardID].cardImage.position().left,
        y: CARD_OBJECTS[cardID].cardImage.position().top
    }, {
        x: getDeckCardPosX(0),
        y: DECK.y
    }, {
        x: 0.1,
        y: 0.1
    }) && isInPos({
        x: CARD_OBJECTS[prevCardID].cardImage.position().left,
        y: CARD_OBJECTS[prevCardID].cardImage.position().top
    }, {
        x: getDeckCardPosX(0),
        y: DECK.y
    }, {
        x: 0.1,
        y: 0.1
    })) {
        CARD_OBJECTS[prevCardID].cardImage.css("z-index", 1);
        let prevPrevCardID = DECK.cardIDs[DECK.cardIDs.indexOf(prevCardID) + 1];
        if (prevPrevCardID != undefined)
            CARD_OBJECTS[prevPrevCardID].cardImage.css("z-index", 0);
    }
}

function resetDeck(excludingLast, moveTime) {
    for (let i = 0; i < (DECK.cardIDs.length - excludingLast); i++) {
        let cardID = DECK.cardIDs[i];
        CARD_OBJECTS[cardID].lastPosX = DECK.x;
        CARD_OBJECTS[cardID].lastPosY = DECK.y;
        CARD_OBJECTS[cardID].turnFaceDown();
        CARD_OBJECTS[cardID].cardImage.css("z-index", 0);
        moveCardToLastPos(cardID, moveTime);
    }
    for (let i = 0; i < excludingLast; i++) {
        let cardID = DECK.cardIDs[DECK.cardIDs.length - excludingLast + i];
        CARD_OBJECTS[cardID].lastPosX = getDeckCardPosX(Math.max(0, GAME_DIFFICULTY - 1 - i));
        CARD_OBJECTS[cardID].lastPosY = DECK.y;
        moveCardToLastPos(cardID, moveTime);
    }
    deckFaceUpCards = excludingLast;
}

function checkForAutoComplete() {
    let autoCompletable = true;
    for (let rank = 1; rank <= 13; rank++) {
        for (let suit = 1; suit <= 4; suit++) {
            let cardID = getCardID(rank, suit);
            if ($.inArray(cardID, DECK.cardIDs) == -1) {
                if (!(CARD_OBJECTS[cardID].faceUp)) {
                    autoCompletable = false;
                    break;
                }
            }
        }
        if (!autoCompletable) break;
    }
    if (autoCompletable) autoComplete();
}

function autoComplete() {
    gameFinished = true;
    clearInterval(timeScoreTimer);
    resetDeckButton.hide();
    movingCards = [];
    for (let rank = 1; rank <= 13; rank++) {
        for (let suit = 1; suit <= 4; suit++) {
            let cardID = getCardID(rank, suit);
            CARD_OBJECTS[cardID].turnFaceUp();
            for (let i = 0; i < foundations.length; i++)
                if (tryAddToFoundation(cardID, i, autoCompleteTime)) break;
        }
    }
    setTimeout(() => gameOver(), autoCompleteTime);
}

// Foundations
foundationSrc = "IMAGES/foundation.png";

class Foundation {
    constructor() {
        this.x = undefined;
        gameArea.append("<img class=\"card\" src=\"" + foundationSrc + "\" draggable=false>");
        this.background = $("img[src$=\"" + foundationSrc + "\"]").last();
        this.background.css("z-index", 0);
        this.cardIDs = [];
    }

    setX(newX) {
        this.x = newX;
        this.background.css("left", this.x - (this.background.width() / 2));
        this.background.css("top", foundationY);
        for (let i = 0; i < this.cardIDs.length; i++) {
            this.setCardPos(this.cardIDs[i]);
            moveCardToLastPos(this.cardIDs[i], cardMoveTime);
        }
    }

    addCard(cardID, moveTime) {
        this.cardIDs = this.cardIDs.concat([cardID]);
        this.setCardPos(cardID);
        if (this.cardIDs.length > 1)
            CARD_OBJECTS[this.cardIDs[this.cardIDs.length - 2]].cardImage.attr("draggable", false);
        setFoundationCardZindex(cardID);
        moveCardToLastPos(cardID, moveTime);
    }

    setCardPos(cardID) {
        CARD_OBJECTS[cardID].lastPosX = this.x - (CARD_OBJECTS[cardID].cardImage.width() / 2);
        CARD_OBJECTS[cardID].lastPosY = foundationY;
    }

    removeCard(cardID) {
        this.cardIDs = this.cardIDs.filter(item => item != cardID);
        if (this.cardIDs.length > 0)
            CARD_OBJECTS[this.cardIDs[this.cardIDs.length - 1]].cardImage.attr("draggable", true);
    }
}

for (let i = 0; i < numberOfFoundations; i++)
    foundations[i] = new Foundation();

function canAddToFoundation(cardID, index) {
    let addable = false;
    let foundationEmpty = !(foundations[index].cardIDs.length > 0);
    if ((CARD_OBJECTS[cardID].rank != CARD_RANKS.Ace) && !foundationEmpty) {
        let foundationLastCardID = foundations[index].cardIDs[foundations[index].cardIDs.length - 1];
        if ((CARD_OBJECTS[foundationLastCardID].rank == (CARD_OBJECTS[cardID].rank - 1)) && (CARD_OBJECTS[foundationLastCardID].suit == CARD_OBJECTS[cardID].suit)) {
            addable = true;
        }
    } else if ((CARD_OBJECTS[cardID].rank == CARD_RANKS.Ace) && foundationEmpty) {
        addable = true;
    }
    return addable
}

function isFromFoundation(cardID, index) {
    let result = false;
    if (isInPos({
        x: CARD_OBJECTS[cardID].lastPosX + (CARD_OBJECTS[cardID].cardImage.width() / 2),
        y: CARD_OBJECTS[cardID].lastPosY
    }, {
        x: foundations[index].x,
        y: foundationY
    }, {
        x: 0.1,
        y: 0.1
    })) {
        result = true;
    }
    return result
}

function tryAddToFoundation(cardID, index, moveTime) {
    let added = false;
    if (canAddToFoundation(cardID, index) && (movingCards.length <= 1)) {
        let foundationFromIndex = -1;
        if (!(isFromDeck(cardID))) {
            let removed = false;
            for (let j = 0; j < tableaux.length; j++) {
                if (isFromTableau(cardID, j)) {
                    tableaux[j].removeCard(cardID);
                    removed = true;
                    break;
                }
            }
            if (!removed) {
                for (let j = 0; j < foundations.length; j++) {
                    if (isFromFoundation(cardID, j)) {
                        foundationFromIndex = j;
                        if (j != index) {
                            foundations[j].removeCard(cardID);
                        }
                        break;
                    }
                }
            }
        }
        if (index != foundationFromIndex) {
            foundations[index].addCard(cardID, moveTime);
            if (foundationFromIndex == -1) {
                setPointsScore(10);
            }
            added = true;
        }
    }
    return added
}

function setFoundationCardZindex(cardID) {
    CARD_OBJECTS[cardID].cardImage.css("z-index", CARD_OBJECTS[cardID].rank);
}

// Tableaux
class Tableau {
    constructor() {
        this.x = undefined;
        this.cardIDs = [];
    }

    setX(newX) {
        this.x = newX;
        this.calculateCardPadding();
    }

    calculateCardPadding(zIndex) {
        if (this.cardIDs.length > 1) {
            this.cardPadding = (gameAreaBoundaries.top + gameArea.height() - tableauTop - cardImageSize.height) / (this.cardIDs.length - 1);
        } else {
            this.cardPadding = 0;
        }
        if (this.cardPadding > tableauMaxCardPadding) {
            this.cardPadding = tableauMaxCardPadding;
        }
        for (let i = 0; i < this.cardIDs.length; i++) {
            CARD_OBJECTS[this.cardIDs[i]].lastPosX = this.x - (CARD_OBJECTS[this.cardIDs[i]].cardImage.width() / 2);
            CARD_OBJECTS[this.cardIDs[i]].lastPosY = tableauTop + (i * this.cardPadding);
            if (i == (this.cardIDs.length - 1)) {
                if (zIndex != undefined) {
                    CARD_OBJECTS[this.cardIDs[i]].cardImage.css("z-index", zIndex);
                } else {
                    setTableauCardZindex(this.cardIDs[i]);
                }
            }
            moveCardToLastPos(this.cardIDs[i], cardMoveTime);
        }
    }

    addCard(cardID, zIndex) {
        this.cardIDs = this.cardIDs.concat([cardID]);
        this.calculateCardPadding(zIndex);
    }

    removeCard(cardID) {
        this.cardIDs = this.cardIDs.filter(function (item) {
            return item != cardID;
        })
        if (this.cardIDs.length > 0) {
            let lastCardID = this.cardIDs[this.cardIDs.length - 1];
            CARD_OBJECTS[lastCardID].turnFaceUp(function (currentCardID) {
                setTableauCardZindex(currentCardID);
                CARD_OBJECTS[currentCardID].cardImage.attr("draggable", true);
                setPointsScore(5);
                checkForAutoComplete();
            });
        }
        this.calculateCardPadding();
    }
}

for (let i = 0; i < numberOfTableax; i++) {
    tableaux[i] = new Tableau();
}

function canAddToTableau(cardID, index) {
    let addable = false;
    let tableauEmpty = !(tableaux[index].cardIDs.length > 0);
    if ((CARD_OBJECTS[cardID].rank != CARD_RANKS.King) && !tableauEmpty) {
        let tableauLastCardID = tableaux[index].cardIDs[tableaux[index].cardIDs.length - 1];
        if ((CARD_OBJECTS[tableauLastCardID].rank == (CARD_OBJECTS[cardID].rank + 1)) && (CARD_OBJECTS[tableauLastCardID].suitColor != CARD_OBJECTS[cardID].suitColor)) {
            addable = true;
        }
    } else if ((CARD_OBJECTS[cardID].rank == CARD_RANKS.King) && tableauEmpty) {
        addable = true;
    }
    return addable
}

function isFromTableau(cardID, index) {
    let result = false;
    if (isInPos({
        x: CARD_OBJECTS[cardID].lastPosX + (CARD_OBJECTS[cardID].cardImage.width() / 2),
        y: undefined
    }, {
        x: tableaux[index].x,
        y: undefined
    }, {
        x: 0.1,
        y: 0.1
    })) {
        result = true;
    }
    return result
}

function setTableauCardZindex(cardID) {
    CARD_OBJECTS[cardID].cardImage.css("z-index", tableaux.length + 13 - CARD_OBJECTS[cardID].rank);
}

// Resizing
function calculateSizes() {
    gameAreaBoundaries = {
        left: gameContainer.position().left + parseInt(gameContainer.css("margin-left").replace("px", "")) + parseInt(gameArea.css("margin-left").replace("px", "")) + parseInt(gameArea.css("padding-left").replace("px", "")),
        top: gameContainer.position().top + parseInt(gameContainer.css("margin-top").replace("px", "")) + parseInt(scoreArea.css("height").replace("px", "")) + parseInt(gameArea.css("margin-top").replace("px", "")) + parseInt(gameArea.css("padding-top").replace("px", ""))
    };
    DECK.x = gameAreaBoundaries.left;
    DECK.y = gameAreaBoundaries.top;
    setCardImageSize(gameArea.width() / Math.max((tableaux.length + 1), (1 + GAME_DIFFICULTY + numberOfFoundations)));
    resetDeckButton.css("width", cardImageSize.width);
    resetDeckButton.css("height", cardImageSize.height);
    resetDeckButton.css("left", DECK.x);
    resetDeckButton.css("top", DECK.y);
    dropBuffer = cardImageSize.width / 2;
    resetDeck(deckFaceUpCards, 0);
    foundationY = gameAreaBoundaries.top;
    for (let i = 0; i < foundations.length; i++) {
        foundations[i].setX(gameAreaBoundaries.left + (gameArea.width() * (1 - foundationAreaWidth)) + (gameArea.width() * foundationAreaWidth / foundations.length * (i + 0.5)));
        foundations[i].background.css("width", cardImageSize.width);
        foundations[i].background.css("height", cardImageSize.height);
        for (let j = 0; j < foundations[i].cardIDs.length; j++) {
            foundations[i].setCardPos(foundations[i].cardIDs[j]);
            moveCardToLastPos(foundations[i].cardIDs[j], cardMoveTime);
        }
    }
    topMargin = cardImageSize.height / 5;
    tableauTop = gameAreaBoundaries.top + cardImageSize.height + topMargin;
    tableauMaxCardPadding = cardImageSize.height / 4;
    for (let i = 0; i < tableaux.length; i++) {
        tableaux[i].setX(gameAreaBoundaries.left + (gameArea.width() / tableaux.length * (i + 0.5)));
    }
}
CARD_OBJECTS[getCardID(1, 1)].cardImage.on("load", function () {
    if (!gameLoaded) {
        gameLoaded = true;
        cardImageRatio = CARD_OBJECTS[getCardID(1, 1)].cardImage.height() / CARD_OBJECTS[getCardID(1, 1)].cardImage.width();
        calculateSizes();
    }
})
calculateSizes();

$(window).resize(function () {
    calculateSizes();
});

// Action
function dragStart(event, card) {
    if (gameStarted && !(card.is(":animated"))) {
        let thisCardID = parseInt(card.attr("data-cardID"));
        if (isCardInLastPos(thisCardID) && !(card.is(":animated")) && (CARD_OBJECTS[thisCardID].cardImage.attr("draggable") == "true") && (movingCards.length == 0)) {
            if (isTouchScreenDevice) {
                event.preventDefault();
            }
            CARD_OBJECTS[thisCardID].selectedXOffset = event.pageX - CARD_OBJECTS[thisCardID].lastPosX;
            CARD_OBJECTS[thisCardID].selectedYOffset = event.pageY - CARD_OBJECTS[thisCardID].lastPosY;
            CARD_OBJECTS[thisCardID].cardImage.css("z-index", parseInt(CARD_OBJECTS[thisCardID].cardImage.css("z-index")) + (tableaux.length + 13));
            movingCards = [{
                ID: thisCardID,
                image: card,
                yOffset: 0,
                selectedXOffset: CARD_OBJECTS[thisCardID].selectedXOffset,
                selectedYOffset: CARD_OBJECTS[thisCardID].selectedYOffset
            }];
            for (let j = 0; j < tableaux.length; j++) {
                if (isFromTableau(thisCardID, j)) {
                    let thisCardIndex = tableaux[j].cardIDs.indexOf(thisCardID);
                    if (thisCardIndex < (tableaux[j].cardIDs.length - 1)) {
                        for (let k = (thisCardIndex + 1); k < tableaux[j].cardIDs.length; k++) {
                            let belowCardID = tableaux[j].cardIDs[k];
                            CARD_OBJECTS[belowCardID].cardImage.css("z-index", parseInt(CARD_OBJECTS[belowCardID].cardImage.css("z-index")) + (tableaux.length + 13));
                            movingCards[movingCards.length] = {
                                ID: belowCardID,
                                image: CARD_OBJECTS[belowCardID].cardImage,
                                yOffset: CARD_OBJECTS[belowCardID].lastPosY - CARD_OBJECTS[thisCardID].lastPosY
                            };
                        }
                    }
                    break;
                }
            }
        }
    }
}

function drag(event, card) {
    let thisCardID = parseInt(card.attr("data-cardID"));
    if (gameStarted && !(card.is(":animated")) && (CARD_OBJECTS[thisCardID].cardImage.attr("draggable") == "true")) {
        for (let j = 0; j < movingCards.length; j++) {
            if (event.pageX != 0 && event.pageY != 0) {
                let posX = event.pageX - movingCards[0].selectedXOffset;
                let posY = event.pageY - movingCards[0].selectedYOffset + movingCards[j].yOffset;

                // Boundaries
                if (posX < gameAreaBoundaries.left) {
                    movingCards[j].image.css("left", gameAreaBoundaries.left + "px");
                } else if (posX > (gameAreaBoundaries.left + gameArea.width() - movingCards[j].image.width())) {
                    movingCards[j].image.css("left", gameAreaBoundaries.left + gameArea.width() - movingCards[j].image.width() + "px");
                } else {
                    movingCards[j].image.css("left", posX + "px");
                }
                if (posY < gameAreaBoundaries.top) {
                    movingCards[j].image.css("top", gameAreaBoundaries.top + "px");
                } else if (posY > (gameAreaBoundaries.top + gameArea.height() - movingCards[j].image.height())) {
                    movingCards[j].image.css("top", gameAreaBoundaries.top + gameArea.height() - movingCards[j].image.height() + "px");
                } else {
                    movingCards[j].image.css("top", posY + "px");
                }
            }
        }
    }
}

function dragEnd(card) {
    let movesScoreSet = false;
    for (let j = 0; j < movingCards.length; j++) {
        CARD_OBJECTS[movingCards[j].ID].cardImage.css("z-index", parseInt(CARD_OBJECTS[movingCards[j].ID].cardImage.css("z-index")) - (tableaux.length + 13));
        let added = false;
        for (let k = 0; k < foundations.length; k++) {
            if (isInPos({
                x: movingCards[j].image.position().left + (movingCards[j].image.width() / 2),
                y: movingCards[j].image.position().top
            }, {
                x: foundations[k].x,
                y: foundationY
            }, {
                x: dropBuffer,
                y: dropBuffer
            })) {
                added = tryAddToFoundation(movingCards[j].ID, k, cardMoveTime);
                if (added) {
                    break;
                }
            }
        }
        if (!added) {
            for (let k = 0; k < tableaux.length; k++) {
                if (isInPos({
                    x: movingCards[j].image.position().left + (movingCards[j].image.width() / 2),
                    y: movingCards[j].image.position().top + (movingCards[j].image.height() / 2)
                }, {
                    x: tableaux[k].x,
                    y: tableauTop + ((gameAreaBoundaries.top + gameArea.height() - tableauTop) / 2)
                }, {
                    x: dropBuffer,
                    y: ((gameAreaBoundaries.top + gameArea.height() - tableauTop) / 2) + dropBuffer
                }) && canAddToTableau(movingCards[j].ID, k)) {
                    let removed = false;
                    let tableauFromIndex = -1;
                    if (!(isFromDeck(movingCards[j].ID))) {
                        for (let l = 0; l < foundations.length; l++) {
                            if (isFromFoundation(movingCards[j].ID, l)) {
                                foundations[l].removeCard(movingCards[j].ID);
                                setPointsScore(-15);
                                removed = true;
                                break;
                            }
                        }
                        if (!removed) {
                            for (let l = 0; l < tableaux.length; l++) {
                                if (isFromTableau(movingCards[j].ID, l)) {
                                    tableauFromIndex = l;
                                    if (l != k) {
                                        tableaux[l].removeCard(movingCards[j].ID);
                                        removed = true;
                                    }
                                    break;
                                }
                            }
                        }
                    }
                    if (k != tableauFromIndex) {
                        tableaux[k].addCard(movingCards[j].ID);
                        if (!removed) {
                            setPointsScore(5);
                        }
                        added = true;
                        break;
                    }
                }
            }
        }
        if (!added) {
            moveCardToLastPos(movingCards[j].ID, cardMoveTime);
        } else if (!movesScoreSet) {
            setMovesScore();
            movesScoreSet = true;
        }
    }
    movingCards = [];
}

gameArea.on("click", function (event) {
    event.preventDefault();
    if (gameStarted) {
        if (isInPos({
            x: event.pageX,
            y: event.pageY
        }, {
            x: DECK.x + (cardImageSize.width / 2),
            y: DECK.y + (cardImageSize.height / 2)
        }, {
            x: cardImageSize.width / 2,
            y: cardImageSize.height / 2
        })) {
            if (deckFaceUpCards > 0) {
                CARD_OBJECTS[DECK.cardIDs[DECK.cardIDs.length - 1 - (deckFaceUpCards - 1)]].cardImage.attr("draggable", false);
            }
            if (deckDealTimer == undefined) {
                let i = 0;
                let finished = false;
                let reset = false;
                deckDealTimer = setInterval(function () {
                    if (deckFaceUpCards < DECK.cardIDs.length) {
                        let cardID = DECK.cardIDs[DECK.cardIDs.length - 1 - deckFaceUpCards];
                        CARD_OBJECTS[cardID].lastPosX = getDeckCardPosX(GAME_DIFFICULTY - 1);
                        CARD_OBJECTS[cardID].cardImage.css("z-index", GAME_DIFFICULTY + 2);
                        CARD_OBJECTS[cardID].turnFaceUp();
                        moveCardToLastPos(cardID, deckCardDealTime, function (currentCardID) {
                            isDeckDealOnLastCard(currentCardID);
                            CARD_OBJECTS[currentCardID].cardImage.css("z-index", parseInt(CARD_OBJECTS[currentCardID].cardImage.css("z-index")) - 1);
                        });
                        for (let j = 1; j <= (GAME_DIFFICULTY - 1); j++) {
                            let prevCardID = DECK.cardIDs[DECK.cardIDs.indexOf(cardID) + j];
                            if (prevCardID != undefined) {
                                if (CARD_OBJECTS[prevCardID].lastPosX == CARD_OBJECTS[DECK.cardIDs[DECK.cardIDs.indexOf(prevCardID) - 1]].lastPosX) {
                                    CARD_OBJECTS[prevCardID].lastPosX = getDeckCardPosX(GAME_DIFFICULTY - 1 - j);
                                    moveCardToLastPos(prevCardID, deckCardDealTime, function (currentCardID) {
                                        isDeckDealOnLastCard(currentCardID);
                                        CARD_OBJECTS[currentCardID].cardImage.css("z-index", parseInt(CARD_OBJECTS[currentCardID].cardImage.css("z-index")) - 1);
                                    });
                                }
                            }
                        }
                        deckFaceUpCards++;
                        i++;
                        if (i >= GAME_DIFFICULTY) {
                            finished = true;
                        }
                    } else {
                        if (i == 0) {
                            resetDeck(0, cardMoveTime);
                            if (GAME_DIFFICULTY == GAME_TYPES.Easy) {
                                setPointsScore(-100);
                            }
                            CARD_OBJECTS[DECK.cardIDs[0]].cardImage.attr("draggable", false);
                            reset = true;
                        }
                        finished = true;
                    }
                    if (finished) {
                        if (!reset) {
                            CARD_OBJECTS[DECK.cardIDs[DECK.cardIDs.length - 1 - (deckFaceUpCards - 1)]].cardImage.attr("draggable", true);
                        }
                        clearInterval(deckDealTimer);
                        deckDealTimer = undefined;
                    }
                },
                    deckCardDealTime);
                setMovesScore();
            }
        }
    } else {
        initialClick();
    }
});
for (let rank = 1; rank <= 13; rank++) {
    for (suit = 1; suit <= 4; suit++) {
        let cardID = getCardID(rank, suit);
        if (!isTouchScreenDevice) {
            CARD_OBJECTS[cardID].cardImage.on("dragstart", function (event) {
                dragStart(event, $(this));
            });

            CARD_OBJECTS[cardID].cardImage.on("drag", function (event) {
                drag(event, $(this));
            });

            CARD_OBJECTS[cardID].cardImage.on("dragend", function (event) {
                dragEnd(event, $(this));
            });
        } else {
            CARD_OBJECTS[cardID].cardImage.on("touchstart", function (event) {
                dragStart(event, $(this));
            });

            CARD_OBJECTS[cardID].cardImage.on("touchmove", function (event) {
                drag(event, $(this));
                event.stopPropagation();
            });

            CARD_OBJECTS[cardID].cardImage.on("touchend", function (event) {
                dragEnd($(this));
            });

            CARD_OBJECTS[cardID].cardImage.on("touchcancel", function (event) {
                $(this).trigger("touchend");
            });
        }
    }
}