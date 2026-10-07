document.body.dataset.theme = localStorage.getItem("aac-theme") || "pink";
const brightness = localStorage.getItem("aac-brightness") || "100";
document.documentElement.style.setProperty("--app-brightness", `${brightness}%`);
document.body.style.filter = `brightness(${brightness}%)`;

(() => {
    "use strict";
    const overlay = document.getElementById("cardEditorOverlay");
    const form = document.getElementById("cardEditorForm");
    const textInput = document.getElementById("editorText");
    const imageInput = document.getElementById("editorImage");
    const preview = document.getElementById("editorImagePreview");
    const layoutButton = document.getElementById("toggleCardLayout");
    let activeCard = null;
    let pendingImage = null;

    function imageOnly() { return localStorage.getItem("orkid-card-image-only-mode") === "true"; }
    function applyImageOnly() {
        const enabled = imageOnly();
        document.body.classList.toggle("cards-image-only", enabled);
        layoutButton.textContent = enabled ? "نمایش متن" : "حذف متن";
        layoutButton.classList.toggle("active", enabled);
    }
    function layout() {
        document.querySelectorAll(".left-grid,.right-grid").forEach(grid => {
            const n = grid.querySelectorAll(".word-card[data-card-id]").length;
            const cols = n <= 1 ? 1 : 2;
            grid.style.setProperty("--card-columns", cols);
            grid.style.gridTemplateColumns = `repeat(${cols},minmax(0,1fr))`;
            grid.style.gridTemplateRows = `repeat(${Math.max(1,Math.ceil(n/cols))},minmax(0,1fr))`;
        });
    }
    function data(card) {
        const img = card.querySelector(".image-placeholder img");
        return { text: card.dataset.word || card.querySelector(".word-label")?.textContent.trim() || "", image: img?.getAttribute("src") || "", alt: img?.alt || "" };
    }
    function showPreview(src, alt="") {
        preview.replaceChildren();
        if (!src) { preview.textContent = "تصویر ندارد"; return; }
        const img = document.createElement("img"); img.src=src; img.alt=alt; preview.appendChild(img);
    }
    function open(card) {
        activeCard=card; pendingImage=null;
        const d=data(card); textInput.value=d.text; imageInput.value=""; showPreview(d.image,d.text);
        overlay.hidden=false; document.body.classList.add("editor-open"); textInput.focus();
    }
    function close() { overlay.hidden=true; document.body.classList.remove("editor-open"); activeCard=null; pendingImage=null; form.reset(); }
    function readImage(file) { return new Promise((resolve,reject)=>{ const r=new FileReader(); r.onload=()=>resolve(r.result); r.onerror=reject; r.readAsDataURL(file); }); }

    window.OrkidCardState?.apply();
    applyImageOnly(); layout();

    document.addEventListener("click", e => {
        const edit=e.target.closest(".card-edit-button");
        if (edit) { e.preventDefault(); e.stopPropagation(); const card=edit.closest(".word-card[data-card-id]"); if(card) open(card); }
        else if (e.target===overlay) close();
    }, true);

    imageInput.addEventListener("change", async () => {
        const file=imageInput.files?.[0]; if(!file) return;
        pendingImage=await readImage(file); showPreview(pendingImage,textInput.value.trim());
    });

    form.addEventListener("submit", e => {
        e.preventDefault(); if(!activeCard) return;
        const id=activeCard.dataset.cardId;
        const old=data(activeCard);
        const newText=textInput.value.trim();
        const newImage=pendingImage || old.image;
        const label=activeCard.querySelector(".word-label");
        if(label) label.textContent=newText;
        activeCard.dataset.word=newText;
        let img=activeCard.querySelector(".image-placeholder img");
        if(newImage && !img){ img=document.createElement("img"); activeCard.querySelector(".image-placeholder")?.appendChild(img); }
        if(img && newImage){ img.src=newImage; img.alt=newText; }
        window.OrkidCardState.patch(id,{text:newText,image:newImage,alt:newText,deleted:false});
        close();
    });

    document.getElementById("editorDelete").addEventListener("click", () => {
        if(!activeCard) return;
        const id=activeCard.dataset.cardId;
        window.OrkidCardState.patch(id,{...data(activeCard),deleted:true});
        activeCard.remove(); close(); layout();
    });

    layoutButton.addEventListener("click", () => {
        localStorage.setItem("orkid-card-image-only-mode", String(!imageOnly()));
        applyImageOnly();
    });
    document.getElementById("saveAllChanges").addEventListener("click", () => location.href="./index.html");
    document.getElementById("cardEditorClose").addEventListener("click",close);
    document.getElementById("editorCancel").addEventListener("click",close);
    document.getElementById("settingsButton")?.addEventListener("click",()=>location.href="./settings.html");
    window.addEventListener("resize",layout);
})();
