const config = {
    autoTextWpm: 300,
    autoTextMinimum: 400,
};

const state = {
    currentDialogue: [],
    currentIndex: 0,
    paused: false,
};

const locations = ["cafe"];

locations.forEach(key => {
    state[key] = {};
    state[key].currentIndex = 0;
    const locationBox = document.getElementById("locationBox");
    const li = document.createElement('li');
    li.innerHTML = key + "<br>";
    li.style.color = 'lightgreen';
    li.onclick = () => updateDialogueSelect(key);
    locationBox.appendChild(li);
});

function updateDialogueSelect(clickedLocation) {
    state.currentLocation = clickedLocation;
    advance();
}
document.addEventListener('keydown', function (event) {
    if (event.key === ' ' || event.code === 'Space') {
        event.preventDefault();
        advance();
    }
});

function advance() {
    const currentLocation = state.currentLocation;
    const currentIndex = state[currentLocation].currentIndex;
    const currentPrompt = linearDialogue[currentLocation].dialogues[currentIndex];
    const speaker = currentPrompt[0];
    const text = currentPrompt[1];
    storyBox.setAttribute("data-character", speaker);
    document.getElementById("storyBox").innerHTML = text;

    state[state.currentLocation].currentIndex += 1;

    const delay = text.length / 5 * 60 / config.autoTextWpm * 1000;
    const minimum = config.autoTextMinimum;
    setTimeout(autoText, Math.max(minimum, delay));
    updateHistory();
}

function autoText() {
    if (!state.paused) advance();
}

function updateHistory() {
    let history = "";

    const currentLocation = state.currentLocation;
    const currentIndex = state[currentLocation].currentIndex;
    const dialogues = linearDialogue[currentLocation].dialogues;
    for (const [index, value] of dialogues.entries()) {
        if (index === currentIndex) {
            document.getElementById("historyBox").innerHTML = history;
            break;
        }
        const speaker = value[0];
        const text = value[1];
        history += `<span class="${speaker.toLowerCase()}">${text}</span><br>`;
    }
}

function nextInvestigateDialogue(el, location) {
    const currentIndex = location.currentIndex;
    if (location.dialogues.length < currentIndex + 1) return;
    const dialogue = location.dialogues[currentIndex]
        .map(([name, text]) => `<span class="${name.toLowerCase()}">${text}</span>`);
    focusDialogue(dialogue);
    location.currentIndex = currentIndex + 1;
    if (location.dialogues.length < currentIndex + 2) el.style.color = 'lightgray';
}

function focusDialogue(dialogue) {
    state.currentDialogue = dialogue;
    document.addEventListener('click', advanceDialogue, true);
    document.getElementById('storyBox').innerHTML = "";

    const fakeClick = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
    });

    advanceDialogue(fakeClick);
}

function advanceDialogue(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    document.getElementById('storyBox').innerHTML += state.currentDialogue[state.currentIndex] + '<br>';
    state.currentIndex += 1;
    if (state.currentIndex >= state.currentDialogue.length) {
        document.getElementById('storyBox').innerHTML += " ->";
        document.removeEventListener('click', advanceDialogue, true);
        state.currentIndex = 0;
    }
}

const dialogueBox = document.getElementById('storyBox');

let startX = 0;
let startY = 0;
let endX = 0;
let endY = 0;
let isDragging = false;

dialogueBox.addEventListener('pointerdown', (e) => {
    startX = e.clientX;
    startY = e.clientY;
    isDragging = true;
});

window.addEventListener('pointerup', (e) => {
    if (!isDragging) return;

    endX = e.clientX;
    endY = e.clientY;
    isDragging = false;
    handleGesture();
});

function handleGesture() {
    const xDiff = endX - startX;
    const yDiff = endY - startY;
    const distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);

    const swipeThreshold = 25;
    const tapThreshold = 10;

    if (distance < tapThreshold) {
        onTap();
    } else if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (Math.abs(xDiff) > swipeThreshold) {
            if (xDiff < 0) {
                onSwipeLeft();
            } else {
                onSwipeRight();
            }
        }
    } else {
        if (Math.abs(yDiff) > swipeThreshold) {
            if (yDiff < 0) {
                onSwipeUp();
            } else {
                onSwipeDown();
            }
        }
    }
}

function onTap() {
    state.paused = !state.paused;
    if (!state.paused) advance();
}

function onSwipeUp() {
    const historyBox = document.getElementById('historyBox');
    historyBox.scrollTop = historyBox.scrollHeight;
    historyBox.style.visibility = "visible";
}
function onSwipeDown() {
    document.getElementById("historyBox").style.visibility = "hidden";
}
function onSwipeLeft() { }
function onSwipeRight() { }