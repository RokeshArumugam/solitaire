var CARD_RANKS = {
    Ace: 1,
    Two: 2,
    Three: 3,
    Four: 4,
    Five: 5,
    Six: 6,
    Seven: 7,
    Eight: 8,
    Nine: 9,
    Ten: 10,
    Jack: 11,
    Queen: 12,
    King: 13
};

var CARD_SUITS = {
    Spades: 1,
    Diamonds: 2,
    Clubs: 3,
    Hearts: 4
};
var CARD_OBJECTS = {};
var DECK;
var cardImageRatio = 3.5 / 2.5;
var cardImageSize;
var cardsDir = imagesDir;
var cardBackImage = cardsDir + "back.png";
var cardMaxWidth = 100;
var cardFlipTime = 250;

class Card {
    constructor(rank, suit) {
        this.rank = rank;
        this.suit = suit;
        this.suitColor = ((suit % 2) == 1) ? "Black" : "Red";
        this.cardID = getCardID(this.rank, this.suit);
        this.cardImage;
        this.faceUpImage = cardsDir + this.cardID + ".png";
        this.faceUp = false;
        this.lastPosX;
        this.lastPosY;
        this.selectedXOffset;
        this.selectedYOffset;
    }

    setCardImage() {
        this.cardImage = $("[data-cardID=" + this.cardID + "]");
        this.lastPosX = this.cardImage.position().left;
        this.lastPosY = this.cardImage.position().top;
        this.cardImage.attr("src", (this.faceUp) ? this.faceUpImage : cardBackImage);
    }

    turnFaceUp(completion) {
        if (!(this.faceUp)) {
            this.flip(completion);
        }
    }

    turnFaceDown(completion) {
        if (this.faceUp) {
            this.flip(completion);
        }
    }

    flip(completion) {
        var tempWidth = this.cardImage.width();
        animateCard(this.cardID, {
            width: 0,
            marginLeft: this.cardImage.width() / 2,
            marginTop: -(this.cardImage.height() / 8)
        }, cardFlipTime / 2, function (currentCardID) {
            if (!CARD_OBJECTS[currentCardID].faceUp) {
                CARD_OBJECTS[currentCardID].cardImage.attr("src", CARD_OBJECTS[currentCardID].faceUpImage);
            } else {
                CARD_OBJECTS[currentCardID].cardImage.attr("src", cardBackImage);
            }
            CARD_OBJECTS[currentCardID].faceUp = !CARD_OBJECTS[currentCardID].faceUp;
            animateCard(currentCardID, {
                width: tempWidth,
                marginLeft: 0,
                marginTop: 0
            }, cardFlipTime / 2, function (current2CardID) {
                if (completion != undefined) {
                    completion(current2CardID);
                }
            });
        })
    }
}

class Deck {
    constructor() {
        this.x = undefined;
        this.y = undefined;
        this.cardIDs = [];
    }

    addCard(cardID) {
        this.cardIDs = this.cardIDs.concat([cardID]);
        CARD_OBJECTS[cardID].lastPosX = this.x;
        CARD_OBJECTS[cardID].lastPosY = this.y;
        moveCardToLastPos(cardID, 0);
    }

    removeCard(cardID) {
        this.cardIDs = this.cardIDs.filter(function (item) {
            return item != cardID;
        })
    }
}

function getCardID(rank, suit) {
    return (rank * 10) + suit
}

function generateCards(area) {
    DECK = new Deck();
    for (var rank = 1; rank <= 13; rank++) {
        for (suit = 1; suit <= 4; suit++) {
            var cardID = getCardID(rank, suit);
            CARD_OBJECTS[cardID] = new Card(rank, suit);
            area.append("<img class=\"card\" data-cardID=\"" + cardID + "\" draggable=false>");
            CARD_OBJECTS[cardID].setCardImage();
            DECK.cardIDs[DECK.cardIDs.length] = cardID;
        }
    }
    shuffle();
}

function setCardImageSize(width) {
    width = Math.min(width, cardMaxWidth);
    for (var rank = 1; rank <= 13; rank++) {
        for (suit = 1; suit <= 4; suit++) {
            var cardID = getCardID(rank, suit);
            CARD_OBJECTS[cardID].cardImage.css("width", width + "px");
            CARD_OBJECTS[cardID].cardImage.css("height", (width * cardImageRatio) + "px");
        }
    }
    cardImageSize = {
        width: CARD_OBJECTS[getCardID(1, 1)].cardImage.width(),
        height: CARD_OBJECTS[getCardID(1, 1)].cardImage.height()
    }
}

function shuffle() {
    for (var i = 0; i < 100; i++) {
        var swapFirstIndex = Math.round(Math.random() * (DECK.cardIDs.length - 1));
        var swapSecondIndex = Math.round(Math.random() * (DECK.cardIDs.length - 1));
        if (swapFirstIndex > 51) {
            console.log(swapFirstIndex);
        }
        if (swapSecondIndex > 51) {
            console.log(swapSecondIndex);
        }
        var tempCardID = DECK.cardIDs[swapFirstIndex];
        DECK.cardIDs[swapFirstIndex] = DECK.cardIDs[swapSecondIndex];
        DECK.cardIDs[swapSecondIndex] = tempCardID;
    }
}

function animateCard(cardID, properties, moveTime, completion) {
    CARD_OBJECTS[cardID].cardImage.animate(properties, {
        queue: false,
        duration: moveTime,
        complete: function () {
            if (completion != undefined) {
                completion(cardID);
            }
        }
    });
}

// Dragging
var cardMoveTime = 300;

function isCardInLastPos(cardID) {
    return isInPos({
        x: CARD_OBJECTS[cardID].cardImage.position().left,
        y: CARD_OBJECTS[cardID].cardImage.position().top
    }, {
        x: CARD_OBJECTS[cardID].lastPosX,
        y: CARD_OBJECTS[cardID].lastPosY
    }, {
        x: 0.1,
        y: 0.1
    })
}

function isInPos(cardPos, pos, buffer) {
    var inPosX = false;
    var inPosY = false;
    if ((buffer.x == undefined) && (buffer.y == undefined)) {
        buffer.x = 0;
        buffer.y = 0;
    } else if ((buffer.x == undefined) && (buffer.y != undefined)) {
        buffer.x == buffer.y
    } else if ((buffer.x != undefined) && (buffer.y == undefined)) {
        buffer.y == buffer.x
    }
    if ((cardPos.x != undefined) && (pos.x != undefined)) {
        inPosX = (cardPos.x >= (pos.x - buffer.x)) && (cardPos.x <= (pos.x + buffer.x));
    } else {
        inPosX = true;
    }
    if ((cardPos.y != undefined) && (pos.y != undefined)) {
        inPosY = (cardPos.y >= (pos.y - buffer.y)) && (cardPos.y <= (pos.y + buffer.y));
    } else {
        inPosY = true;
    }
    return inPosX && inPosY
}

function moveCardToLastPos(cardID, moveTime, completion) {
    animateCard(cardID, {
        "left": CARD_OBJECTS[cardID].lastPosX,
        "top": CARD_OBJECTS[cardID].lastPosY
    }, moveTime, completion);
}
