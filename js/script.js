// =========================================
// THEME
// =========================================

const savedTheme = localStorage.getItem("aac-theme") || "pink";
document.body.dataset.theme = savedTheme;


// =========================================
// AAC SENTENCE BUILDER + TEXT TO SPEECH
// =========================================

let sentenceWords = [];

const sentenceDisplay = document.getElementById("sentence-display");


// =========================================
// انتخاب تمام کارت‌های دارای data-word
// =========================================

const wordButtons = document.querySelectorAll("[data-word]");


// =========================================
// دکمه‌های پایین
// =========================================

const controlButtons = document.querySelectorAll(".control-button");

const deleteButton = controlButtons[0];
const previousButton = controlButtons[1];

// فعلاً دکمه «بگو» در HTML وجود ندارد
const speakButton = null;


// =========================================
// وضعیت خواندن
// =========================================

let isSpeaking = false;
let currentUtterance = null;


// =========================================
// اضافه کردن کلمه
// =========================================

function addWord(word) {

    if (!word || word.trim() === "") {
        return;
    }

    // اگر در حال خواندن هستیم،
    // اجازه تغییر جمله نمی‌دهیم
    if (isSpeaking) {
        return;
    }

    sentenceWords.push(word);

    renderSentence();
}


// =========================================
// نمایش جمله
// =========================================

function renderSentence() {

    if (!sentenceDisplay) {
        return;
    }

    sentenceDisplay.innerHTML = "";

    sentenceWords.forEach((word, index) => {

        const wordElement = document.createElement("span");

        wordElement.classList.add("selected-word");

        wordElement.dataset.index = index;

        wordElement.textContent = word;

        sentenceDisplay.appendChild(wordElement);

        // فاصله بین کلمات
        if (index < sentenceWords.length - 1) {
            sentenceDisplay.appendChild(
                document.createTextNode(" ")
            );
        }

    });
}


// =========================================
// کلیک روی کارت‌ها
// =========================================

wordButtons.forEach(button => {

    button.addEventListener("click", function () {

        const word = this.dataset.word;

        addWord(word);

    });

});


// =========================================
// دکمه قبلی
// =========================================

if (previousButton) {

    previousButton.addEventListener("click", function () {

        // اگر در حال خواندن است
        // اجازه تغییر نمی‌دهیم
        if (isSpeaking) {
            return;
        }

        if (sentenceWords.length === 0) {
            return;
        }

        sentenceWords.pop();

        renderSentence();

    });

}


// =========================================
// دکمه حذف
// =========================================

if (deleteButton) {

    deleteButton.addEventListener("click", function () {

        // اگر در حال خواندن است
        // اول خواندن را متوقف کن
        if (isSpeaking) {
            stopSpeaking();
        }

        sentenceWords = [];

        renderSentence();

    });

}


// =========================================
// خواندن جمله
// =========================================

function speakSentence() {

    if (!("speechSynthesis" in window)) {
        return;
    }

    if (sentenceWords.length === 0) {
        return;
    }

    // اگر مرورگر قبلاً چیزی می‌خواند
    window.speechSynthesis.cancel();

    const sentence = sentenceWords.join(" ");

    currentUtterance =
        new SpeechSynthesisUtterance(sentence);

    // زبان فارسی
    currentUtterance.lang = "fa-IR";

    // سرعت خواندن
    currentUtterance.rate = 0.85;

    // زیر و بمی صدا
    currentUtterance.pitch = 1;

    // شروع وضعیت خواندن
    isSpeaking = true;


    // =====================================
    // وقتی خواندن شروع می‌شود
    // =====================================

    currentUtterance.onstart = function () {

        isSpeaking = true;

        if (speakButton) {

            speakButton.classList.add("speaking");

            const circle =
                speakButton.querySelector(".control-circle");

            if (circle) {
                circle.classList.add("speaking-circle");
            }

        }

    };


    // =====================================
    // تشخیص کلمه در حال خواندن
    // =====================================

    currentUtterance.onboundary = function (event) {

        const charIndex = event.charIndex;

        highlightWord(charIndex);

    };


    // =====================================
    // پایان خواندن
    // =====================================

    currentUtterance.onend = function () {

        finishSpeaking();

    };


    // =====================================
    // خطا
    // =====================================

    currentUtterance.onerror = function () {

        finishSpeaking();

    };


    // =====================================
    // شروع خواندن
    // =====================================

    window.speechSynthesis.speak(currentUtterance);
}


// =========================================
// هایلایت کردن کلمه
// =========================================

function highlightWord(charIndex) {

    if (!sentenceDisplay) {
        return;
    }

    const wordElements =
        sentenceDisplay.querySelectorAll(".selected-word");

    let currentPosition = 0;

    let activeIndex = -1;


    for (let i = 0; i < sentenceWords.length; i++) {

        const word = sentenceWords[i];

        const wordStart = currentPosition;

        const wordEnd =
            currentPosition + word.length;


        if (
            charIndex >= wordStart &&
            charIndex < wordEnd
        ) {

            activeIndex = i;

            break;
        }


        // طول کلمه + فاصله
        currentPosition += word.length + 1;

    }


    // حذف هایلایت قبلی
    wordElements.forEach(element => {

        element.classList.remove("reading");

    });


    // هایلایت کلمه فعلی
    if (activeIndex !== -1) {

        if (wordElements[activeIndex]) {

            wordElements[activeIndex]
                .classList.add("reading");

        }

    }

}


// =========================================
// پایان وضعیت خواندن
// =========================================

function finishSpeaking() {

    isSpeaking = false;

    currentUtterance = null;


    if (speakButton) {

        speakButton.classList.remove("speaking");

        const circle =
            speakButton.querySelector(".control-circle");

        if (circle) {
            circle.classList.remove("speaking-circle");
        }

    }


    // حذف هایلایت
    if (sentenceDisplay) {

        const wordElements =
            sentenceDisplay.querySelectorAll(".selected-word");

        wordElements.forEach(element => {

            element.classList.remove("reading");

        });

    }

}


// =========================================
// توقف خواندن
// =========================================

function stopSpeaking() {

    if ("speechSynthesis" in window) {

        window.speechSynthesis.cancel();

    }

    finishSpeaking();

}


// =========================================
// دکمه تنظیمات
// =========================================

const settingsButton =
    document.getElementById("settingsButton");

if (settingsButton) {

    settingsButton.addEventListener("click", function () {

        window.location.href = "./settings.html";

    });

}

// =========================================
// LOAD SAVED BRIGHTNESS
// =========================================

const savedBrightness =
    localStorage.getItem("aac-brightness") || "100";

document.documentElement.style.setProperty(
    "--app-brightness",
    `${savedBrightness}%`
);

document.body.style.filter =
    `brightness(${savedBrightness}%)`;