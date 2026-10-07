const savedTheme = localStorage.getItem("aac-theme") || "pink";
const savedBrightness = localStorage.getItem("aac-brightness") || "100";
document.body.dataset.theme = savedTheme;
document.documentElement.style.setProperty("--app-brightness", `${savedBrightness}%`);
document.body.style.filter = `brightness(${savedBrightness}%)`;
document.body.classList.toggle("cards-image-only", localStorage.getItem("orkid-card-image-only-mode") === "true");

const sentenceDisplay = document.getElementById("sentence-display");
let sentenceItems = [];

function updateSidebarLayout() {
    document.querySelectorAll(".left-grid, .right-grid").forEach(grid => {
        const count = grid.querySelectorAll(".word-card.image-card[data-card-id]").length;
        const columns = count <= 1 ? 1 : 2;
        const rows = Math.max(1, Math.ceil(count / columns));
        grid.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
        grid.style.gridTemplateRows = `repeat(${rows}, minmax(0, 1fr))`;
    });
}

function getCardImage(card) {
    const image = card.querySelector(".image-placeholder img");
    return image ? { src: image.src, alt: image.alt || card.dataset.word || "" } : null;
}

function addItem(word, image = null) {
    const value = (word || "").trim();
    if (!value) return;
    sentenceItems.push({ word: value, image });
    renderSentence();
}

function renderSentence() {
    if (!sentenceDisplay) return;
    sentenceDisplay.replaceChildren();
    sentenceItems.forEach(item => {
        const token = document.createElement("span");
        token.className = "selected-item";
        if (item.image?.src) {
            const img = document.createElement("img");
            img.className = "selected-item-image";
            img.src = item.image.src;
            img.alt = item.image.alt || item.word;
            token.appendChild(img);
        }
        if (!document.body.classList.contains("cards-image-only")) {
            const text = document.createElement("span");
            text.className = "selected-word";
            text.textContent = item.word;
            token.appendChild(text);
        }
        sentenceDisplay.appendChild(token);
    });
}

function speakText(text) {
    if (!("speechSynthesis" in window) || !text) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fa-IR";
    utterance.rate = 0.85;
    const preferred = localStorage.getItem("aac-voice") || "female";
    const voices = speechSynthesis.getVoices().filter(v => v.lang.toLowerCase().startsWith("fa"));
    if (voices.length) utterance.voice = preferred === "male" ? voices[voices.length - 1] : voices[0];
    speechSynthesis.speak(utterance);
}

window.OrkidCardState?.apply();
updateSidebarLayout();

document.querySelectorAll(".word-card.image-card[data-card-id]").forEach(card => {
    card.addEventListener("click", () => {
        const word = card.dataset.word || "";
        addItem(word, getCardImage(card));
        speakText(word);
    });
});

document.querySelectorAll(".sentence-word[data-word]").forEach(button => {
    button.addEventListener("click", () => {
        const word = button.dataset.word || "";
        addItem(word);
        speakText(word);
    });
});

document.querySelector('.control-button[aria-label="حذف"]')?.addEventListener("click", () => {
    speechSynthesis?.cancel();
    sentenceItems = [];
    renderSentence();
});

document.getElementById("educationButton")?.addEventListener("click", () => location.href = "./education.html");
document.getElementById("settingsButton")?.addEventListener("click", () => location.href = "./settings.html");
window.addEventListener("resize", updateSidebarLayout);
