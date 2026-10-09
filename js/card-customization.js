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
    let pendingSpeech = null;
    let pendingSource = null;

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
            if (window.matchMedia("(max-width: 800px), (orientation: landscape) and (max-height: 700px) and (max-width: 1250px)").matches) {
                grid.style.gridTemplateRows = "none";
                grid.style.gridAutoRows = "auto";
            } else {
                grid.style.gridTemplateRows = `repeat(${Math.max(1,Math.ceil(n/cols))},minmax(0,1fr))`;
                grid.style.gridAutoRows = "";
            }
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
        activeCard=card; pendingImage=null; pendingSpeech=null; pendingSource=null;
        const d=data(card); textInput.value=d.text; imageInput.value=""; showPreview(d.image,d.text);
        overlay.hidden=false;
        window.dispatchEvent(new Event("orkid-editor-open"));
        document.body.classList.add("editor-open");
        document.querySelector(".card-editor-modal")?.scrollTo(0,0);
        // Mobile keyboards can shrink the visual viewport: don't auto-activate it.
        if (!window.matchMedia("(max-width: 800px), (orientation: landscape) and (max-height: 700px) and (max-width: 1250px)").matches) textInput.focus({preventScroll:true});
    }
    function close() { document.getElementById("lessonPicker").hidden=true; overlay.hidden=true; document.body.classList.remove("editor-open","lesson-picker-open"); activeCard=null; pendingImage=null; pendingSpeech=null; pendingSource=null; form.reset(); }
    function readImage(file) { return new Promise((resolve,reject)=>{ const r=new FileReader(); r.onload=()=>resolve(r.result); r.onerror=reject; r.readAsDataURL(file); }); }

    window.addEventListener("orkid-ai-image-selected",event=>{pendingImage=event.detail.image;showPreview(pendingImage,textInput.value.trim());});
    window.OrkidCardState?.apply();
    applyImageOnly(); layout();
    const requestedId=new URLSearchParams(location.search).get("edit");
    if(requestedId){const requested=[...document.querySelectorAll(".word-card[data-card-id]")].find(c=>c.dataset.cardId===requestedId);if(requested)requestAnimationFrame(()=>open(requested));}

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
        activeCard.dataset.speech=pendingSpeech || newText;
        let img=activeCard.querySelector(".image-placeholder img");
        if(newImage && !img){ img=document.createElement("img"); activeCard.querySelector(".image-placeholder")?.appendChild(img); }
        if(img && newImage){ img.src=newImage; img.alt=newText; }
        try { window.OrkidCardState.patch(id,{text:newText,image:newImage,alt:newText,speechText:pendingSpeech || newText,source:pendingSource || "custom",deleted:false}); close(); } catch(error) { alert("ذخیره کارت ممکن نشد. ممکن است حافظه مرورگر پر شده باشد."); console.error(error); }
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
    const picker=document.getElementById("lessonPicker");
    const category=document.getElementById("lessonCategory");
    const choices=document.getElementById("lessonChoices");
    Object.entries(lessons).forEach(([key,lesson])=>{
        const option=document.createElement("option");option.value=key;option.textContent=lesson.title;category.appendChild(option);
    });
    function showChoices(){
        choices.replaceChildren();
        lessons[category.value].items.forEach((item,index)=>{
            const button=document.createElement("button");button.type="button";button.className="lesson-choice";button.dataset.lessonIndex=index;
            const img=document.createElement("img");img.src=item.image;img.alt=item.speechText;
            const label=document.createElement("span");label.textContent=item.label;
            button.append(img,label);
            button.addEventListener("click",()=>{
                pendingImage=item.image;pendingSpeech=item.speechText;
                window.dispatchEvent(new CustomEvent("orkid-lesson-selected",{detail:{category:category.value,index,action:item.speechText}}));
                pendingSource={category:category.value,index};
                textInput.value=item.label;showPreview(item.image,item.speechText);
                closePicker();
            });choices.appendChild(button);
        });
    }
    function openPicker(){
        showChoices();
        overlay.hidden=true;
        picker.hidden=false;
        document.body.classList.add("lesson-picker-open");
        category.focus();
    }
    function closePicker(){
        picker.hidden=true;
        document.body.classList.remove("lesson-picker-open");
        if(activeCard){ overlay.hidden=false; if(!window.matchMedia("(max-width: 800px)").matches) document.getElementById("openLessonPicker").focus({preventScroll:true}); }
    }
    document.getElementById("openLessonPicker").addEventListener("click",openPicker);
    document.getElementById("closeLessonPicker").addEventListener("click",closePicker);
    picker.addEventListener("click",event=>{if(event.target===picker)closePicker();});
    document.addEventListener("keydown",event=>{if(event.key==="Escape"){if(!picker.hidden){event.preventDefault();closePicker();}else if(!overlay.hidden){event.preventDefault();close();}}});
    category.addEventListener("change",showChoices);
    document.addEventListener("orkid-added-cards-rendered",()=>{layout();const id=new URLSearchParams(location.search).get("edit");if(id){const card=[...document.querySelectorAll(".word-card[data-card-id]")].find(c=>c.dataset.cardId===id);if(card)open(card);}});
    window.addEventListener("resize",layout);
})();
