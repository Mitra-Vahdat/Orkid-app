
const theme=localStorage.getItem("aac-theme")||"pink";
const brightness=localStorage.getItem("aac-brightness")||"100";
document.body.dataset.theme=theme;
document.documentElement.style.setProperty("--app-brightness",`${brightness}%`);
document.body.style.filter=`brightness(${brightness}%)`;

const canvas=document.getElementById("drawingCanvas");
const ctx=canvas.getContext("2d",{alpha:false});
const workspace=document.querySelector(".drawing-workspace");
const colors=[...document.querySelectorAll(".color-button")];
const eraser=document.getElementById("eraserButton");
const clear=document.getElementById("clearButton");
function paperColor(){
return getComputedStyle(document.body).getPropertyValue("--drawing-paper").trim()||"#fffaf0";
}
const LINE_WIDTH=12;
let drawing=false;
let color="#2f3437";
let erasing=false;
let last=null;

function fillPaper(){
ctx.save();
ctx.fillStyle=paperColor();
ctx.fillRect(0,0,canvas.width,canvas.height);
ctx.restore();
}

function resizeCanvas(){
const rect=workspace.getBoundingClientRect();
const ratio=Math.max(1,window.devicePixelRatio||1);
const old=document.createElement("canvas");
old.width=canvas.width;old.height=canvas.height;
if(old.width&&old.height)old.getContext("2d").drawImage(canvas,0,0);
canvas.width=Math.max(1,Math.round(rect.width*ratio));
canvas.height=Math.max(1,Math.round(rect.height*ratio));
fillPaper();
if(old.width&&old.height)ctx.drawImage(old,0,0,old.width,old.height,0,0,canvas.width,canvas.height);
ctx.lineCap="round";ctx.lineJoin="round";
}

function point(event){
const rect=canvas.getBoundingClientRect();
return {
x:(event.clientX-rect.left)*(canvas.width/rect.width),
y:(event.clientY-rect.top)*(canvas.height/rect.height)
};
}

function start(event){
if(event.pointerType==="mouse"&&event.button!==0)return;
drawing=true;last=point(event);
canvas.setPointerCapture?.(event.pointerId);
ctx.beginPath();ctx.arc(last.x,last.y,(LINE_WIDTH*(canvas.width/canvas.getBoundingClientRect().width))/2,0,Math.PI*2);
ctx.fillStyle=erasing?paperColor():color;ctx.fill();
}

function move(event){
if(!drawing)return;
const next=point(event);
const scale=canvas.width/canvas.getBoundingClientRect().width;
ctx.beginPath();
ctx.moveTo(last.x,last.y);ctx.lineTo(next.x,next.y);
ctx.strokeStyle=erasing?paperColor():color;
ctx.lineWidth=LINE_WIDTH*scale;
ctx.lineCap="round";ctx.lineJoin="round";ctx.stroke();
last=next;
}

function end(event){
drawing=false;last=null;
try{canvas.releasePointerCapture?.(event.pointerId)}catch{}
}

colors.forEach(button=>button.addEventListener("click",()=>{
color=button.dataset.color;erasing=false;
eraser.classList.remove("active");
colors.forEach(item=>item.classList.toggle("active",item===button));
}));

eraser.addEventListener("click",()=>{
erasing=!erasing;
eraser.classList.toggle("active",erasing);
if(erasing)colors.forEach(item=>item.classList.remove("active"));
else colors.find(item=>item.dataset.color===color)?.classList.add("active");
});

clear.addEventListener("click",fillPaper);
canvas.addEventListener("pointerdown",start);
canvas.addEventListener("pointermove",move);
canvas.addEventListener("pointerup",end);
canvas.addEventListener("pointercancel",end);
window.addEventListener("resize",resizeCanvas);
requestAnimationFrame(resizeCanvas);
