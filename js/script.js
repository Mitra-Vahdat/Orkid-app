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
const speakButton = controlButtons[1];
const previousButton = controlButtons[2];


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


// =========================================
// دکمه حذف
// =========================================

deleteButton.addEventListener("click", function () {

    // اگر در حال خواندن است
    // اول خواندن را متوقف کن
    if (isSpeaking) {

        stopSpeaking();

    }

    sentenceWords = [];

    renderSentence();

});


// =========================================
// دکمه بگو
// =========================================

speakButton.addEventListener("click", function () {

    // اگر در حال خواندن است،
    // دوباره شروع نکن
    if (isSpeaking) {
        return;
    }

    if (sentenceWords.length === 0) {
        return;
    }

    speakSentence();

});


// =========================================
// خواندن جمله
// =========================================

function speakSentence() {

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

    // تغییر ظاهر دکمه بگو
    speakButton.classList.add("speaking");

    speakButton.querySelector(".control-circle")
        .classList.add("speaking-circle");


    // =====================================
    // وقتی خواندن شروع می‌شود
    // =====================================

    currentUtterance.onstart = function () {

        isSpeaking = true;

        speakButton.classList.add("speaking");

        speakButton.querySelector(".control-circle")
            .classList.add("speaking-circle");

    };


    // =====================================
    // تشخیص کلمه در حال خواندن
    // =====================================

    currentUtterance.onboundary = function (event) {

        /*
         event.charIndex مشخص می‌کند
         مرورگر در حال خواندن کجای متن است.
        */

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


    // شروع خواندن
    window.speechSynthesis.speak(currentUtterance);

}


// =========================================
// هایلایت کردن کلمه
// =========================================

function highlightWord(charIndex) {

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

        wordElements[activeIndex]
            .classList.add("reading");

    }

}


// =========================================
// پایان وضعیت خواندن
// =========================================

function finishSpeaking() {

    isSpeaking = false;

    currentUtterance = null;

    speakButton.classList.remove("speaking");

    speakButton.querySelector(".control-circle")
        .classList.remove("speaking-circle");


    // حذف هایلایت

    const wordElements =
        sentenceDisplay.querySelectorAll(".selected-word");

    wordElements.forEach(element => {

        element.classList.remove("reading");

    });


    /*
     * جمله را پاک نمی‌کنیم.
     *
     * کودک همچنان جمله را می‌بیند.
     */

}


// =========================================
// توقف خواندن
// =========================================

function stopSpeaking() {

    window.speechSynthesis.cancel();

    finishSpeaking();

}