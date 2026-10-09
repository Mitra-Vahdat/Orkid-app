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

const defaultSettings = {

    theme: "pink",

    brightness: 100,

    voice: "female"

};

const savedTheme =
    localStorage.getItem("aac-theme")
    || defaultSettings.theme;

const savedBrightness =
    localStorage.getItem("aac-brightness")
    || defaultSettings.brightness;

const savedVoice =
    localStorage.getItem("aac-voice")
    || defaultSettings.voice;

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

themeButtons.forEach(button => {

    button.addEventListener("click", function () {

        applyTheme(
            this.dataset.theme
        );

    });

});

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

// Back navigation is managed by navigation.js.

if (customizeCards) {

    customizeCards.addEventListener(
        "click",
        function () {

            window.location.href =
                "./card-customization.html";

        }
    );

}

applyTheme(savedTheme);

if (brightnessSlider) {

    brightnessSlider.value =
        savedBrightness;

}

applyBrightness(savedBrightness);

applyVoice(savedVoice);
const themeDialog=document.getElementById("themeDialog");
const themeTrigger=document.getElementById("openThemeDialog");
const dismissTheme=()=>{if(!themeDialog)return;themeDialog.hidden=true;themeTrigger?.focus({preventScroll:true});};
themeTrigger?.addEventListener("click",()=>{if(themeDialog){themeDialog.hidden=false;document.getElementById("closeThemeDialog")?.focus({preventScroll:true});}});
document.getElementById("closeThemeDialog")?.addEventListener("click",dismissTheme);
themeDialog?.addEventListener("click",e=>{if(e.target===themeDialog)dismissTheme()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!themeDialog?.hidden)dismissTheme()});
themeButtons.forEach(b=>b.addEventListener("click",dismissTheme));
