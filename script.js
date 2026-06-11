const config = {
    autoTextDelay: 30,
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

document.getElementById("storyBox").addEventListener("click", function () {
    state.paused = !state.paused;
    advance();
});

function advance() {
    const currentIndex = state[state.currentLocation].currentIndex;
    const currentPrompt = linearDialogue[state.currentLocation].dialogues[currentIndex];
    const speaker = currentPrompt[0];
    const text = currentPrompt[1];
    storyBox.setAttribute("data-character", speaker);
    document.getElementById("storyBox").innerHTML = text;

    state[state.currentLocation].currentIndex += 1;

    const delay = text.length * config.autoTextDelay;
    const minimum = config.autoTextMinimum;
    setTimeout(autoText, Math.max(minimum, delay));
}

function autoText() {
    if (!state.paused) advance();
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