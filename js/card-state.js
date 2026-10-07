(() => {
    "use strict";
    const KEY = "orkid-card-state-v3";
    const LEGACY_KEY = "orkid-card-customizations-v2";

    function read(key) {
        try { return JSON.parse(localStorage.getItem(key)) || {}; }
        catch { return {}; }
    }

    function getState() {
        const current = read(KEY);
        if (Object.keys(current).length) return current;
        const legacy = read(LEGACY_KEY);
        if (Object.keys(legacy).length) {
            localStorage.setItem(KEY, JSON.stringify(legacy));
            return legacy;
        }
        return {};
    }

    function setState(state) {
        localStorage.setItem(KEY, JSON.stringify(state));
        localStorage.setItem(LEGACY_KEY, JSON.stringify(state));
        return state;
    }

    function patch(id, patch) {
        const state = getState();
        state[id] = { ...(state[id] || {}), ...patch };
        setState(state);
        window.dispatchEvent(new CustomEvent("orkid-card-state-changed", { detail: { id, value: state[id] } }));
        return state[id];
    }

    function apply(root = document) {
        const state = getState();
        root.querySelectorAll(".word-card.image-card[data-card-id]").forEach(card => {
            const saved = state[card.dataset.cardId];
            if (!saved) return;
            if (saved.deleted === true) {
                card.remove();
                return;
            }
            const label = card.querySelector(".word-label, :scope > span:not(.card-edit-label):not(.card-edit-button)");
            if (label && typeof saved.text === "string") label.textContent = saved.text;
            if (typeof saved.text === "string") card.dataset.word = saved.text;
            const imageBox = card.querySelector(".image-placeholder");
            let image = imageBox?.querySelector("img");
            if (saved.image) {
                if (!image && imageBox) {
                    image = document.createElement("img");
                    imageBox.appendChild(image);
                }
                if (image) {
                    image.src = saved.image;
                    image.alt = saved.text || saved.alt || card.dataset.word || "";
                }
            }
        });
        return state;
    }

    window.OrkidCardState = { KEY, getState, setState, patch, apply };
})();
