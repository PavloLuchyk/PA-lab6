const suites = ['hearts', 'diamonds', 'clovers', 'pikes'];
const ranks = 'A 2 3 4 5 6 7 8 9 10 J Q K Joker'.split(' ');
let currentCards = [];
let myCards = [];
let aiCards = [];
let selectedCard = null;
let playerScore = 0;
let aiScore = 0;
let playerTurn = true;
let playerPlaces = true;


class Card {
  constructor(rank, suit) {
    this.suit =suit;
    this.rank = rank;
  }
}

class Robot {
  constructor(blackCard, redCard) {
    this.blackCard = blackCard;
    this.redCard = redCard;
  }
}

class AI {
  constructor(initialDepth) {
    this.initialDepth = initialDepth;
  }

  expectimax(depth, cards, opponentRobot, robot, isAttacking, isMaximizing) {
    if (depth == 0) {
      return this.evaluate(cards, robot, isAttacking )
    }
    let bestMove;
    let copiedCards = copyArray(cards);
    let copiedRobot = this.copyRobot(opponentRobot);
    if (isMaximizing) {
      let best = -Infinity;
      if (isAttacking) {
        let possibleAttacks = this.getPossibleMoves(opiedCards, opponentRobot, isAttacking);

        for (let i = 0; i < possibleAttacks.length; i++) {
          let newRobot = this.copyRobot(possibleAttacks);

          if (!canBeat(newRobot, opponentRobot)) {
            break;
          } else {
            copiedCards = copiedCards.filter(s => !equals(s, newRobot.redCard));
            copiedCards = copiedCards.filter(s => !equals(s, newRobot.blackCard));
          }

          let val = this.expectimax(depth-1, copiedCards, opponentRobot, robot, false, true);

          if (val > best) {
            best = val;
            bestMove = possibleAttacks[i];
          }
        }

        if (this.initialDepth === depth && bestMove) {
          opponentRobot.redCard = bestMove.redCard;
          opponentRobot.blackCard = bestMove.blackCard;
          aiBeatRobot();
        }
        return best;
      } else {
        let possibleAttacks = this.getPossibleMoves(cards, opponentRobot, isAttacking);

        for (let i = 0; i < possibleAttacks.length; i++) {
          let newRobot = this.copyRobot(possibleAttacks);

          let val = this.expectimax(depth-1, cards, newRobot, opponentRobot, true, false);

          if (val > best) {
            best = val;
            bestMove = possibleAttacks[i];
          }
        }

        if (this.initialDepth === depth && bestMove) {
          opponentRobot.redCard = bestMove.redCard;
          opponentRobot.blackCard = bestMove.blackCard;
          aiPlaces();
        }
        return best;
      }
    } else {
      let best = Infinity;
      if (isAttacking) {
        let possibleAttacks = this.getPossibleMoves(cards, opponentRobot, isAttacking);

        for (let i = 0; i < possibleAttacks.length; i++) {
          let newRobot = this.copyRobot(possibleAttacks);

          if (!canBeat(newRobot, opponentRobot)) {
            break;
          } else {
            copiedCards = copiedCards.filter(s => !equals(s, newRobot.redCard));
            copiedCards = copiedCards.filter(s => !equals(s, newRobot.blackCard));
          }

          let val = this.expectimax(depth-1, cards, newRobot,opponentRobot, false, true);

          if (val < best) {
            best = val;
            bestMove = possibleAttacks[i];
          }
        }

        if (this.initialDepth === depth && bestMove) {
          opponentRobot.redCard = bestMove.redCard;
          opponentRobot.blackCard = bestMove.blackCard;
          aiBeatRobot();
        }
        return best;
      } else {
        let possibleAttacks = this.getPossibleMoves(cards, opponentRobot, isAttacking);

        for (let i = 0; i < possibleAttacks.length; i++) {
          let newRobot = this.copyRobot(possibleAttacks);

          let val = this.expectimax(depth-1, cards, newRobot, opponentRobot, true, false);

          if (val > best) {
            best = val;
            bestMove = possibleAttacks[i];
          }
        }

        if (this.initialDepth === depth && bestMove) {
          opponentRobot.redCard = bestMove.redCard;
          opponentRobot.blackCard = bestMove.blackCard;
          aiPlaces();
        }
        return best;
      }
    }

  }

  evaluate(cards, robot, isAttacking) {
    let remainingCards;
    if (isAttacking) {
       remainingCards =
         cards.filter(card => !isBlackCard(card)&&ranks.indexOf(card.rank)> ranks.indexOf(robot.blackCard));
       return remainingCards.length;
    } else {
      remainingCards =
        cards.filter(card => isBlackCard(card)&&ranks.indexOf(card.rank) > ranks.indexOf(robot.redCard));
      return remainingCards.length;
    }
  }


  getPossibleMoves(cards) {
    let possibleMoves = []
    let possibleArmors = this.possibleArmors(cards);
    let possibleWeapons = this.possibleWeapons(cards);
    for (let armor of possibleArmors) {
      for (let weapon of possibleWeapons) {
        possibleMoves.push(new Robot(weapon, armor));
      }
    }
    return possibleMoves;
  }

  getBestMove(cards, opponentRobot, isAttacking) {
    let possibleArmors = this.possibleArmors(cards);
    let possibleWeapons = this.possibleWeapons(cards);
    let bestRobot = new Robot(possibleWeapons[0], possibleArmors[0]);
    for (let armor of possibleArmors) {
      for (let weapon of possibleWeapons) {
        let newRobot = new Robot(weapon, armor);
        if (this.evaluateRobot(newRobot, opponentRobot, isAttacking) > this.evaluateRobot(bestRobot, opponentRobot,isAttacking)) {
          bestRobot = newRobot;
        }
      }
    }
    return bestRobot;
  }

  possibleArmors(cards) {
    return copyArray(cards).filter(card => !isBlackCard(card));
  }

  possibleWeapons(cards) {
    return copyArray(cards).filter(card => isBlackCard(card));
  }


  copyRobot(robot) {
    return new Robot(new Card(robot.blackCard.suit, robot.blackCard.rank),
      new Card(robot.redCard.suit, robot.redCard.rank));
  }

  evaluateRobot(robot, opponentRobot, isAttacking) {
    if (isAttacking) {
      return this.evaluateAttacking(robot, opponentRobot);
    } else {
      return this.evaluateDefending(robot);
    }
  }

  evaluateAttacking(robot, opponentRobot) {
    let armorValue = ranks.indexOf(robot.redCard.rank)*-100;
    let weaponValue = ranks.indexOf(robot.blackCard.rank)*-100;
    if (!this.canBeat(robot, opponentRobot)) {
      weaponValue = -10000;
    }
    return armorValue + weaponValue;
  }

  evaluateDefending(robot) {
    let armorValue = ranks.indexOf(robot.redCard.rank)*100;
    let weaponValue = ranks.indexOf(robot.blackCard.rank)*(-100);
    return armorValue + weaponValue;
  }

  canBeat(robot, opponentRobot) {
    return opponentRobot.redCard.rank <= robot.blackCard.rank;
  }
}

const isBlackCard = (card) => {
  return card.suit === 'clovers' || card.suit === 'pikes' || card.suit === 'Joker';
}



const equals = (card1, card) => {
  if (card == null|| card1 == null) {
    return false;
  }
  return card1.suit === card.suit && card1.rank === card.rank;
}

const getDeck = () => {
  let cards = [];
  for (let suit of suites) {
    for (let rank of ranks) {
      if (rank === 'Joker') {
        continue;
      }
      cards.push(new Card(rank, suit));
    }
  }
  cards.push(new Card('Joker', 'Joker'));
  cards.push(new Card('Joker', 'Joker'));
  cards = shuffle(cards);
  currentCards = copyArray(cards);
  return cards;
}

const shuffle = (array) => {
  let currentIndex = array.length,  randomIndex;

  while (currentIndex !== 0) {

    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

const passCards = () => {
  let array = [];

  for (let i = 0; i < 10; i++) {
    array.push(currentCards[0]);
    currentCards.shift();
  }

  return array;
}

const copyArray = (cards) => {
  let newCards = [];
  for (let card of cards) {
    newCards.push(card);
  }
  return newCards;
}

const getView = (cards) => {
  let doc2 = document.getElementById('card');
  doc2.innerHTML = '';
  for(let card of cards) {
   let doc = document.createElement("p");
   doc.innerHTML = card.suit + ' ' + card.rank;
   doc2.appendChild(doc);
   ai.expectimax();
  }
}

const update = () => {
  checkWin();
  let myDeck = document.getElementById('my-deck');
  let opponentDeck = document.getElementById('opponent-deck');
  opponentDeck.innerHTML = '';
  myDeck.innerHTML ='';
  if (opponentRobot.redCard) {
    let opponentRed = document.createElement('spam');
    let image = document.createElement('img');
    image.src = `img/${opponentRobot.redCard.suit}${opponentRobot.redCard.rank}.jpg`
    opponentRed.appendChild(image);
    opponentDeck.appendChild(opponentRed);
  }
  if (opponentRobot.blackCard) {
    let opponentRed = document.createElement('span');
    let image = document.createElement('img');
    image.src = `img/${opponentRobot.blackCard.suit}${opponentRobot.blackCard.rank}.jpg`
    opponentRed.appendChild(image);
    opponentDeck.appendChild(opponentRed);
  }
  for(let card of myCards) {
    let doc = document.createElement("button");
    doc.setAttribute('onclick', `selectCard({rank:"${card.rank}", suit: "${card.suit}"})`);
    let image = document.createElement('img');
    image.src = `img/${card.suit}${card.rank}.jpg`
    doc.appendChild(image);
    myDeck.appendChild(doc);
  }

  let playersRobot = document.getElementById('player-robot');
  playersRobot.innerHTML = '';
  if (playerTurn) {
    let armor = document.createElement('button');
    armor.setAttribute('id', 'red1');
    if (selectedCard) {
      if (!isBlackCard(selectedCard)) {
        armor.disabled = false;
        armor.setAttribute('onclick', `placeCard({rank:"${selectedCard.rank}", suit: "${selectedCard.suit}"}, false)`);
      } else {
        armor.disabled = true;
      }
    }
    if (playerRobot.redCard) {
      let image = document.createElement('img');
      image.src = `img/${playerRobot.redCard.suit}${playerRobot.redCard.rank}.jpg`
      armor.appendChild(image);
    }
    playersRobot.appendChild(armor);
    let weapon = document.createElement('button');
    weapon.setAttribute('id', 'black1');
    if (selectedCard) {
      if (isBlackCard(selectedCard)) {
        weapon.disabled = false;
        weapon.setAttribute('onclick', `placeCard({rank:"${selectedCard.rank}", suit: "${selectedCard.suit}"}, true)`);
      } else {
        weapon.disabled = true;
      }
    }
    if (playerRobot.blackCard) {
      let image = document.createElement('img');
      image.src = `img/${playerRobot.blackCard.suit}${playerRobot.blackCard.rank}.jpg`
      weapon.appendChild(image);
    }
    playersRobot.appendChild(weapon);

    let playerControl = document.createElement('div');
    if (playerTurn&&!playerPlaces) {
      let nextTurn = document.createElement('button');
      nextTurn.innerHTML = 'Next turn';
      if (!canBeat(playerRobot, opponentRobot)) {
        nextTurn.disabled = true;
      }
      nextTurn.setAttribute('onclick', 'beatRobot()')
      playerControl.appendChild(nextTurn);
    } else if (playerTurn&&playerPlaces) {
      let nextTurn = document.createElement('button');
      nextTurn.innerHTML = 'End turn';
      if (!playerRobot.redCard||!playerRobot.blackCard) {
        nextTurn.disabled = true;
      }
      nextTurn.setAttribute('onclick', 'nextTurn()')
      playerControl.appendChild(nextTurn);
    }
    let skip = document.createElement('button');
    skip.innerHTML = 'Skip';
    skip.setAttribute('onclick', 'skip()');
    playerControl.appendChild(skip);
    let reset = document.createElement('button');
    reset.innerHTML = 'Reset';
    reset.setAttribute('onclick', 'reset()');
    playerControl.appendChild(reset);
    playersRobot.appendChild(playerControl);
  } else {
    let bestMove = ai.getBestMove(aiCards, playerRobot, !playerPlaces);
    opponentRobot.redCard = bestMove.redCard;
    opponentRobot.blackCard = bestMove.blackCard;
    console.log(bestMove)
    syncDelay(2000);
    if (playerPlaces) {
      console.log("ai places");
      aiPlaces();
    } else {
      console.log("ai moves");
      aiBeatRobot();
    }
  }

}

const canBeat = (robot1, robot2) => {
  if (robot1.blackCard&&robot2.redCard&&robot1.redCard&&robot2.blackCard) {
    if (ranks.indexOf(robot1.blackCard.rank) >= ranks.indexOf(robot2.redCard.rank)) {
      return true;
    }
  }
  return false;
}

const skip = () => {
  setWin('AI');
}

const nextTurn = () => {
  if (playerRobot.redCard&&playerRobot.blackCard) {
    console.log(ai.getBestMove(aiCards, playerRobot, true));
    playerTurn = false;
    playerPlaces = false;
  }
  update();
}

const setWin = (name) => {
  let winningMessage = document.createElement('h1');
  let myDeck = document.getElementById('my-deck');
  winningMessage.innerHTML = `${name} wins`;
  myDeck.appendChild(winningMessage);
  let button = document.createElement('button');
  button.setAttribute('onclick', 'reload()');
  button.innerHTML = "Replay";
  myDeck.appendChild(button);
}


const checkWin = () => {
  if (playerScore >= 10) {
    setWin("Player")
  }
  if (aiScore >= 10) {
    setWin("AI");
  }
}

const aiPlaces = () => {
  if (!playerTurn&&playerPlaces) {
    aiCards = aiCards.filter(s => !equals(s, opponentRobot.redCard));
    aiCards = aiCards.filter(s => !equals(s, opponentRobot.blackCard));
    playerTurn = true;
    playerPlaces = false;

  }
  update();
}

const aiBeatRobot = () => {
  if (!playerTurn&&!playerPlaces) {
    if (canBeat(playerRobot, opponentRobot)) {
      aiCards = aiCards.filter(s => !equals(s, opponentRobot.redCard));
      aiCards = aiCards.filter(s => !equals(s, opponentRobot.blackCard));
      playerRobot.redCard = null;
      playerRobot.blackCard = null;
      opponentRobot.redCard = null;
      opponentRobot.blackCard = null;
      myCards.push(currentCards.shift());
      myCards.push(currentCards.shift());
      aiCards.push(currentCards.shift());
      aiCards.push(currentCards.shift());
      aiScore++;
      playerPlaces = true;
    } else {
      playerTurn = true;
      setWin('Player');
    }
  }
  update();
}

const beatRobot = () => {
  if (playerTurn&&!playerPlaces) {
    if (canBeat(playerRobot, opponentRobot)) {
      playerRobot.redCard = null;
      playerRobot.blackCard = null;
      opponentRobot.redCard = null;
      opponentRobot.blackCard = null;
      myCards.push(currentCards.shift());
      myCards.push(currentCards.shift());
      aiCards.push(currentCards.shift());
      aiCards.push(currentCards.shift());
      playerScore++;
      playerPlaces = true;

    }
  }
  update();
}

const reset = () => {
  if (playerRobot.redCard) {
    myCards.push(playerRobot.redCard);
  }
  if (playerRobot.blackCard) {
    myCards.push(playerRobot.blackCard);
  }
  playerRobot.redCard = null;
  playerRobot.blackCard = null;
  update();
}


const selectCard=(card) => {

  if (equals(card, selectedCard)) {
    selectedCard = null;
  } else {
    selectedCard = card;
  }

  update();
}

const placeCard = (card, isBlack) => {

  if (isBlack) {
    if (playerRobot.blackCard) {
      myCards.push(playerRobot.blackCard);
    }
    myCards = myCards.filter(s => !equals(s, card));
    playerRobot.blackCard = card;

  } else {
    if (playerRobot.redCard) {
        myCards.push(playerRobot.redCard);
    }
    playerRobot.redCard = card;
    myCards = myCards.filter(s => !equals(s, card));
  }
  update();
}

function syncDelay(milliseconds){
  var start = new Date().getTime();
  var end=0;
  while( (end-start) < milliseconds){
    end = new Date().getTime();
  }
}

getDeck();
myCards = passCards();
aiCards = passCards();
const playerRobot = new Robot(null, null);
const opponentRobot = new Robot(null, null);
const ai = new AI(5);
