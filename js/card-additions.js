(()=>{"use strict";
const KEY="orkid-added-cards-v1";
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY))||[]}catch{return []}};
const save=items=>localStorage.setItem(KEY,JSON.stringify(items));
function cardNode(item,editable){
 const card=document.createElement("button");card.type="button";card.className="word-card image-card";card.dataset.cardId=item.id;card.dataset.word=item.text;
 const box=document.createElement("div");box.className="image-placeholder";
 if(item.image){const img=document.createElement("img");img.src=item.image;img.alt=item.text;box.appendChild(img);}
 const label=document.createElement("span");label.className="word-label";label.textContent=item.text;
 card.append(box,label);
 if(editable){const edit=document.createElement("span");edit.className="card-edit-button";edit.setAttribute("role","button");edit.setAttribute("tabindex","0");edit.setAttribute("aria-label","ویرایش کارت");edit.textContent="✎";card.appendChild(edit);}
 return card;
}
window.OrkidAddedCards={read,cardNode,KEY};
const status=document.getElementById("addCardMessage");
document.querySelectorAll(".add-card-row").forEach(btn=>btn.addEventListener("click",()=>{
 const side=btn.dataset.side,items=read();
 const count=items.filter(x=>x.side===side).length;
 if(count>=24){status.textContent="حداکثر ۲۴ کارت اضافی برای این ردیف مجاز است.";return;}
 const id="added-"+side+"-"+(crypto.randomUUID?.()||Date.now()+"-"+Math.random().toString(36).slice(2));
 items.push({id,side,text:"کارت جدید",image:""});
 try{save(items);location.href="./card-customization.html?edit="+encodeURIComponent(id);}
 catch{status.textContent="فضای ذخیره‌سازی مرورگر کافی نیست.";}
}));
})();