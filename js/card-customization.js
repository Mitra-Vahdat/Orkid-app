// =========================================
// CARD CUSTOMIZATION
// =========================================


// =========================================
// DEFAULT CARDS
// =========================================

const defaultCards = [

    // LEFT

    {
        id: "left-1",
        name: "بابا",
        image: "images/cards/بابا.png"
    },

    {
        id: "left-2",
        name: "مامان",
        image: "images/cards/مامان.png"
    },

    {
        id: "left-3",
        name: "کلمه جدید ۱",
        image: "images/cards/NEW-LEFT-1.png"
    },

    {
        id: "left-4",
        name: "دوست",
        image: "images/cards/قلب.png"
    },

    {
        id: "left-5",
        name: "من",
        image: "images/man.png"
    },

    {
        id: "left-6",
        name: "کلمه جدید ۲",
        image: "images/cards/NEW-LEFT-2.png"
    },

    {
        id: "left-7",
        name: "بیرون",
        image: "images/cards/درخت.png"
    },

    {
        id: "left-8",
        name: "خانه",
        image: "images/cards/خانه.png"
    },

    {
        id: "left-9",
        name: "کلمه جدید ۳",
        image: "images/cards/NEW-LEFT-3.png"
    },

    {
        id: "left-10",
        name: "خوشحال",
        image: "images/cards/خوشحال.png"
    },

    {
        id: "left-11",
        name: "ناراحت",
        image: "images/cards/ناراحت.png"
    },

    {
        id: "left-12",
        name: "کلمه جدید ۴",
        image: "images/cards/NEW-LEFT-4.png"
    },


    // RIGHT

    {
        id: "right-1",
        name: "آب",
        image: "images/cards/water-glass-color-icon.svg"
    },

    {
        id: "right-2",
        name: "غذا",
        image: "images/cards/سیب.png"
    },

    {
        id: "right-3",
        name: "کلمه جدید ۱",
        image: "images/cards/NEW-RIGHT-1.png"
    },

    {
        id: "right-4",
        name: "بازی",
        image: "images/cards/توپ.png"
    },

    {
        id: "right-5",
        name: "بخوابم",
        image: "images/cards/خواب.png"
    },

    {
        id: "right-6",
        name: "کلمه جدید ۲",
        image: "images/cards/NEW-RIGHT-2.png"
    },

    {
        id: "right-7",
        name: "بروم",
        image: "images/beram.png"
    },

    {
        id: "right-8",
        name: "می‌خواهم",
        image: "images/mikham.png"
    },

    {
        id: "right-9",
        name: "کلمه جدید ۳",
        image: "images/cards/NEW-RIGHT-3.png"
    },

    {
        id: "right-10",
        name: "دستشویی",
        image: "images/dastshooei.png"
    },

    {
        id: "right-11",
        name: "بخورم",
        image: "images/cards/"
    },

    {
        id: "right-12",
        name: "کلمه جدید ۴",
        image: "images/cards/NEW-RIGHT-4.png"
    },

    {
        id: "right-13",
        name: "کلمه جدید ۵",
        image: "images/cards/NEW-RIGHT-5.png"
    }

];


// =========================================
// STORAGE KEY
// =========================================

const CARDS_STORAGE_KEY = "aac-cards";


// =========================================
// DOM
// =========================================

const cardsContainer =
    document.getElementById("cardsContainer");

const editModal =
    document.getElementById("editModal");

const cardNameInput =
    document.getElementById("cardNameInput");

const cardImageInput =
    document.getElementById("cardImageInput");

const imagePreview =
    document.getElementById("imagePreview");

const closeModalButton =
    document.getElementById("closeModalButton");

const cancelEditButton =
    document.getElementById("cancelEditButton");

const confirmEditButton =
    document.getElementById("confirmEditButton");

const saveChangesButton =
    document.getElementById("saveChangesButton");

const backButton =
    document.getElementById("backButton");


// =========================================
// CURRENT CARDS
// =========================================

let cards = loadCards();

let editingCardId = null;

let selectedNewImage = null;


// =========================================
// LOAD CARDS
// =========================================

function loadCards() {

    const savedCards =
        localStorage.getItem(CARDS_STORAGE_KEY);

    if (!savedCards) {

        return defaultCards.map(card => ({
            ...card,
            deleted: false
        }));

    }

    try {

        const parsedCards =
            JSON.parse(savedCards);

        if (!Array.isArray(parsedCards)) {

            return defaultCards.map(card => ({
                ...card,
                deleted: false
            }));

        }

        return parsedCards;

    } catch (error) {

        console.error(
            "خطا در خواندن کارت‌ها:",
            error
        );

        return defaultCards.map(card => ({
            ...card,
            deleted: false
        }));

    }

}


// =========================================
// SAVE CARDS TO BROWSER
// =========================================

function saveCardsToBrowser() {

    try {

        localStorage.setItem(
            CARDS_STORAGE_KEY,
            JSON.stringify(cards)
        );

        return true;

    } catch (error) {

        console.error(
            "خطا در ذخیره کارت‌ها:",
            error
        );

        alert(
            "ذخیره کارت انجام نشد. ممکن است حجم تصویر انتخاب‌شده زیاد باشد."
        );

        return false;

    }

}


// =========================================
// RENDER CARDS
// =========================================

function renderCards() {

    cardsContainer.innerHTML = "";


    const activeCards =
        cards.filter(card => !card.deleted);


    if (activeCards.length === 0) {

        const emptyState =
            document.createElement("div");

        emptyState.className =
            "empty-state";

        emptyState.textContent =
            "هیچ کارتی وجود ندارد.";

        cardsContainer.appendChild(
            emptyState
        );

        return;

    }


    cards.forEach((card, index) => {

        if (card.deleted) {
            return;
        }


        const cardElement =
            document.createElement("article");

        cardElement.className =
            "custom-card";


        // =====================================
        // IMAGE
        // =====================================

        const imageBox =
            document.createElement("div");

        imageBox.className =
            "custom-card-image";


        const image =
            document.createElement("img");

        image.src = card.image;

        image.alt = card.name;

        imageBox.appendChild(image);


        // =====================================
        // INFO
        // =====================================

        const info =
            document.createElement("div");

        info.className =
            "custom-card-info";


        const name =
            document.createElement("div");

        name.className =
            "custom-card-name";

        name.textContent =
            card.name;


        const number =
            document.createElement("div");

        number.className =
            "custom-card-number";

        number.textContent =
            `کارت ${index + 1}`;


        info.appendChild(name);

        info.appendChild(number);


        // =====================================
        // ACTIONS
        // =====================================

        const actions =
            document.createElement("div");

        actions.className =
            "card-actions";


        const editButton =
            document.createElement("button");

        editButton.className =
            "edit-card-button";

        editButton.type =
            "button";

        editButton.textContent =
            "اصلاح";


        editButton.addEventListener(
            "click",
            function () {

                openEditModal(card.id);

            }
        );


        const deleteButton =
            document.createElement("button");

        deleteButton.className =
            "delete-card-button";

        deleteButton.type =
            "button";

        deleteButton.textContent =
            "حذف";


        deleteButton.addEventListener(
            "click",
            function () {

                deleteCard(card.id);

            }
        );


        actions.appendChild(editButton);

        actions.appendChild(deleteButton);


        // =====================================
        // APPEND
        // =====================================

        cardElement.appendChild(imageBox);

        cardElement.appendChild(info);

        cardElement.appendChild(actions);

        cardsContainer.appendChild(cardElement);

    });

}


// =========================================
// OPEN EDIT MODAL
// =========================================

function openEditModal(cardId) {

    const card =
        cards.find(
            item => item.id === cardId
        );


    if (!card) {
        return;
    }


    editingCardId =
        cardId;


    selectedNewImage =
        null;


    cardNameInput.value =
        card.name;


    imagePreview.src =
        card.image;


    cardImageInput.value =
        "";


    editModal.classList.add("active");

    editModal.setAttribute(
        "aria-hidden",
        "false"
    );


    cardNameInput.focus();

}


// =========================================
// CLOSE MODAL
// =========================================

function closeEditModal() {

    editModal.classList.remove(
        "active"
    );

    editModal.setAttribute(
        "aria-hidden",
        "true"
    );


    editingCardId =
        null;


    selectedNewImage =
        null;


    cardImageInput.value =
        "";

}


// =========================================
// IMAGE SELECT
// =========================================

cardImageInput.addEventListener(
    "change",
    function () {

        const file =
            this.files[0];


        if (!file) {
            return;
        }


        if (!file.type.startsWith("image/")) {

            alert(
                "لطفاً یک فایل تصویری انتخاب کنید."
            );

            this.value = "";

            return;

        }


        const reader =
            new FileReader();


        reader.onload =
            function (event) {

                selectedNewImage =
                    event.target.result;

                imagePreview.src =
                    selectedNewImage;

            };


        reader.readAsDataURL(file);

    }
);


// =========================================
// CONFIRM EDIT
// =========================================

confirmEditButton.addEventListener(
    "click",
    function () {

        if (!editingCardId) {
            return;
        }


        const newName =
            cardNameInput.value.trim();


        if (!newName) {

            alert(
                "لطفاً نام کارت را وارد کنید."
            );

            cardNameInput.focus();

            return;

        }


        const card =
            cards.find(
                item =>
                    item.id === editingCardId
            );


        if (!card) {
            return;
        }


        // تغییر نام

        card.name =
            newName;


        // تغییر تصویر در صورت انتخاب

        if (selectedNewImage) {

            card.image =
                selectedNewImage;

        }


        closeEditModal();

        renderCards();

    }
);


// =========================================
// DELETE CARD
// =========================================

function deleteCard(cardId) {

    const card =
        cards.find(
            item => item.id === cardId
        );


    if (!card) {
        return;
    }


    const confirmed =
        confirm(
            `آیا می‌خواهید کارت «${card.name}» حذف شود؟`
        );


    if (!confirmed) {
        return;
    }


    card.deleted =
        true;


    renderCards();

}


// =========================================
// CLOSE MODAL BUTTONS
// =========================================

closeModalButton.addEventListener(
    "click",
    closeEditModal
);


cancelEditButton.addEventListener(
    "click",
    closeEditModal
);


// =========================================
// CLICK OUTSIDE MODAL
// =========================================

editModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target === editModal
        ) {

            closeEditModal();

        }

    }
);


// =========================================
// ESC
// =========================================

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            editModal.classList.contains("active")
        ) {

            closeEditModal();

        }

    }
);


// =========================================
// SAVE CHANGES
// =========================================

saveChangesButton.addEventListener(
    "click",
    function () {

        const saved =
            saveCardsToBrowser();


        if (!saved) {
            return;
        }


        window.location.href =
            "./index.html";

    }
);


// =========================================
// BACK
// =========================================

backButton.addEventListener(
    "click",
    function () {

        window.location.href =
            "./settings.html";

    }
);


// =========================================
// INITIAL RENDER
// =========================================

renderCards();