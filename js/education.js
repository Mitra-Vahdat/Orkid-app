const lessons={"verbs-1":{"title":"افعال ۱","description":"افعال ساده و روزمره","items":[{"label":"بخور","speechText":"بخور","image":"images/education/verbs-1/01.svg"},{"label":"بیا","speechText":"بیا","image":"images/education/verbs-1/02.svg"},{"label":"برو","speechText":"برو","image":"images/education/verbs-1/03.svg"},{"label":"بخواب","speechText":"بخواب","image":"images/education/verbs-1/04.svg"},{"label":"بنشین","speechText":"بنشین","image":"images/education/verbs-1/05.svg"},{"label":"بایست","speechText":"بایست","image":"images/education/verbs-1/06.svg"},{"label":"بده","speechText":"بده","image":"images/education/verbs-1/07.svg"},{"label":"بگیر","speechText":"بگیر","image":"images/education/verbs-1/08.svg"}]},"verbs-2":{"title":"افعال ۲","description":"فعالیت‌های متنوع‌تر","items":[{"label":"بازی کن","speechText":"بازی کن","image":"images/education/verbs-2/01.svg"},{"label":"بخوان","speechText":"بخوان","image":"images/education/verbs-2/02.svg"},{"label":"بنویس","speechText":"بنویس","image":"images/education/verbs-2/03.svg"},{"label":"باز کن","speechText":"باز کن","image":"images/education/verbs-2/04.svg"},{"label":"ببند","speechText":"ببند","image":"images/education/verbs-2/05.svg"},{"label":"نگاه کن","speechText":"نگاه کن","image":"images/education/verbs-2/06.svg"},{"label":"گوش کن","speechText":"گوش کن","image":"images/education/verbs-2/07.svg"},{"label":"کمک کن","speechText":"کمک کن","image":"images/education/verbs-2/08.svg"}]},"food":{"title":"غذاها و خوراکی‌ها","description":"نام خوراکی‌ها و نوشیدنی‌ها","items":[{"label":"آب","speechText":"آب","image":"images/education/food/01.svg"},{"label":"نان","speechText":"نان","image":"images/education/food/02.svg"},{"label":"برنج","speechText":"برنج","image":"images/education/food/03.svg"},{"label":"شیر","speechText":"شیر","image":"images/education/food/04.svg"},{"label":"پنیر","speechText":"پنیر","image":"images/education/food/05.svg"},{"label":"تخم‌مرغ","speechText":"تخم‌مرغ","image":"images/education/food/06.svg"},{"label":"غذا","speechText":"غذا","image":"images/education/food/07.svg"},{"label":"میان‌وعده","speechText":"میان‌وعده","image":"images/education/food/08.svg"}]},"fruits":{"title":"میوه‌ها و سبزیجات","description":"شناخت میوه‌ها و سبزیجات","items":[{"label":"سیب","speechText":"سیب","image":"images/education/fruits/01.svg"},{"label":"موز","speechText":"موز","image":"images/education/fruits/02.svg"},{"label":"پرتقال","speechText":"پرتقال","image":"images/education/fruits/03.svg"},{"label":"انگور","speechText":"انگور","image":"images/education/fruits/04.svg"},{"label":"خیار","speechText":"خیار","image":"images/education/fruits/05.svg"},{"label":"گوجه","speechText":"گوجه","image":"images/education/fruits/06.svg"},{"label":"هویج","speechText":"هویج","image":"images/education/fruits/07.svg"},{"label":"سیب‌زمینی","speechText":"سیب‌زمینی","image":"images/education/fruits/08.svg"}]},"objects":{"title":"اشیا","description":"اشیای آشنا و روزمره","items":[{"label":"توپ","speechText":"توپ","image":"images/education/objects/01.svg"},{"label":"کتاب","speechText":"کتاب","image":"images/education/objects/02.svg"},{"label":"مداد","speechText":"مداد","image":"images/education/objects/03.svg"},{"label":"لیوان","speechText":"لیوان","image":"images/education/objects/04.svg"},{"label":"قاشق","speechText":"قاشق","image":"images/education/objects/05.svg"},{"label":"صندلی","speechText":"صندلی","image":"images/education/objects/06.svg"},{"label":"میز","speechText":"میز","image":"images/education/objects/07.svg"},{"label":"تلفن","speechText":"تلفن","image":"images/education/objects/08.svg"}]},"colors":{"title":"رنگ‌ها و اشکال","description":"رنگ‌ها و شکل‌های پایه","items":[{"label":"قرمز","speechText":"قرمز","image":"images/education/colors/01.svg"},{"label":"آبی","speechText":"آبی","image":"images/education/colors/02.svg"},{"label":"سبز","speechText":"سبز","image":"images/education/colors/03.svg"},{"label":"زرد","speechText":"زرد","image":"images/education/colors/04.svg"},{"label":"دایره","speechText":"دایره","image":"images/education/colors/05.svg"},{"label":"مربع","speechText":"مربع","image":"images/education/colors/06.svg"},{"label":"مثلث","speechText":"مثلث","image":"images/education/colors/07.svg"},{"label":"مستطیل","speechText":"مستطیل","image":"images/education/colors/08.svg"}]},"numbers":{"title":"اعداد","description":"اعداد و شمارش پایه","items":[{"label":"یک","speechText":"یک","image":"images/education/numbers/01.svg"},{"label":"دو","speechText":"دو","image":"images/education/numbers/02.svg"},{"label":"سه","speechText":"سه","image":"images/education/numbers/03.svg"},{"label":"چهار","speechText":"چهار","image":"images/education/numbers/04.svg"},{"label":"پنج","speechText":"پنج","image":"images/education/numbers/05.svg"},{"label":"شش","speechText":"شش","image":"images/education/numbers/06.svg"},{"label":"هفت","speechText":"هفت","image":"images/education/numbers/07.svg"},{"label":"هشت","speechText":"هشت","image":"images/education/numbers/08.svg"},{"label":"نه","speechText":"نه","image":"images/education/numbers/09.svg"},{"label":"ده","speechText":"ده","image":"images/education/numbers/10.svg"}]}};
const theme=localStorage.getItem("aac-theme")||"pink";
const brightness=localStorage.getItem("aac-brightness")||"100";
document.body.dataset.theme=theme;
document.documentElement.style.setProperty("--app-brightness",`${brightness}%`);
document.body.style.filter=`brightness(${brightness}%)`;

function speak(text){
    if(!("speechSynthesis" in window)||!text)return;
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text);
    u.lang="fa-IR";u.rate=.85;
    const pref=localStorage.getItem("aac-voice")||"female";
    const voices=speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith("fa"));
    if(voices.length)u.voice=pref==="male"?voices[voices.length-1]:voices[0];
    speechSynthesis.speak(u);
}
const grid=document.getElementById("lessonGrid");
if(grid){
    const key=new URLSearchParams(location.search).get("category");
    const lesson=lessons[key]||lessons["verbs-1"];
    document.title=`ارکید | ${lesson.title}`;
    document.getElementById("topicTitle").textContent=lesson.title;
    document.getElementById("topicDescription").textContent=lesson.description;
    const viewer=document.getElementById("lessonViewer");
    const viewerImage=document.getElementById("lessonViewerImage");
    const viewerText=document.getElementById("lessonViewerText");
    const close=document.getElementById("lessonViewerClose");
    lesson.items.forEach(item=>{
        const button=document.createElement("button");
        button.className="lesson-card";button.type="button";
        button.dataset.speech=item.speechText;
        const img=document.createElement("img");img.src=item.image;img.alt=item.speechText;img.className="lesson-card-image";
        const label=document.createElement("strong");label.textContent=item.label;
        button.append(img,label);
        button.addEventListener("click",()=>{
            viewerImage.src=item.image;viewerImage.alt=item.speechText;
            viewerText.textContent=item.label;
            viewer.hidden=false;document.body.classList.add("lesson-open");
            speak(item.speechText);
        });
        grid.appendChild(button);
    });
    const closeViewer=()=>{viewer.hidden=true;document.body.classList.remove("lesson-open");speechSynthesis?.cancel();};
    close.addEventListener("click",closeViewer);
    viewer.addEventListener("click",e=>{if(e.target===viewer)closeViewer();});
    document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!viewer.hidden)closeViewer();});
}
