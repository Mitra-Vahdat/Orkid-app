const themeButtons =
    document.querySelectorAll(".theme-button");

const voiceButtons =
    document.querySelectorAll(".voice-button");

const brightnessSlider =
    document.getElementById("brightnessSlider");

const brightnessValue =
    document.getElementById("brightnessValue");

const backButton =
    document.getElementById("backButton");

const customizeCards =
    document.getElementById("customizeCards");


// =========================================
// DEFAULT SETTINGS
// =========================================

const defaultSettings = {

    theme: "pink",

    brightness: 100,

    voice: "female"

};


// =========================================
// LOAD SAVED SETTINGS
// =========================================

const savedTheme =
    localStorage.getItem("aac-theme")
    || defaultSettings.theme;

const savedBrightness =
    localStorage.getItem("aac-brightness")
    || defaultSettings.brightness;

const savedVoice =
    localStorage.getItem("aac-voice")
    || defaultSettings.voice;


// =========================================
// APPLY THEME
// =========================================

function applyTheme(theme) {

    document.body.dataset.theme = theme;

    themeButtons.forEach(button => {

        button.classList.remove("active");

    });

    const selectedButton =
        document.querySelector(
            `[data-theme="${theme}"]`
        );

    if (selectedButton) {

        selectedButton.classList.add("active");

    }

    localStorage.setItem(
        "aac-theme",
        theme
    );
}


// =========================================
// THEME BUTTONS
// =========================================

themeButtons.forEach(button => {

    button.addEventListener("click", function () {

        applyTheme(
            this.dataset.theme
        );

    });

});


// =========================================
// APPLY BRIGHTNESS
// =========================================

function applyBrightness(value) {

    const brightness =
        Number(value);

    document.documentElement.style.setProperty(
        "--app-brightness",
        `${brightness}%`
    );

    brightnessValue.textContent =
        `${brightness}٪`;

    localStorage.setItem(
        "aac-brightness",
        brightness
    );

}


// =========================================
// BRIGHTNESS SLIDER
// =========================================

if (brightnessSlider) {

    brightnessSlider.addEventListener(
        "input",
        function () {

            applyBrightness(
                this.value
            );

        }
    );

}


// =========================================
// APPLY VOICE
// =========================================

function applyVoice(voice) {

    voiceButtons.forEach(button => {

        button.classList.remove("active");

    });


    const selectedButton =
        document.querySelector(
            `[data-voice="${voice}"]`
        );


    if (selectedButton) {

        selectedButton.classList.add("active");

    }


    localStorage.setItem(
        "aac-voice",
        voice
    );

}


// =========================================
// VOICE BUTTONS
// =========================================

voiceButtons.forEach(button => {

    button.addEventListener(
        "click",
        function () {

            applyVoice(
                this.dataset.voice
            );

        }
    );

});


// =========================================
// BACK TO MAIN PAGE
// =========================================

if (backButton) {

    backButton.addEventListener(
        "click",
        function () {

            window.location.href =
                "./index.html";

        }
    );

}


// =========================================
// CARD CUSTOMIZATION
// =========================================

if (customizeCards) {

    customizeCards.addEventListener(
        "click",
        function () {

            window.location.href =
                "./card-customization.html";

        }
    );

}


// =========================================
// INITIAL SETTINGS
// =========================================

applyTheme(savedTheme);

if (brightnessSlider) {

    brightnessSlider.value =
        savedBrightness;

}

applyBrightness(savedBrightness);

applyVoice(savedVoice);