(()=>{"use strict";
const api=window.OrkidAddedCards;if(!api)return;
const edit=document.body.classList.contains("card-customization-page");
api.read().forEach(item=>{
 const grid=document.querySelector(item.side==="left"?".left-grid":".right-grid");
 if(!grid)return;
 const state=window.OrkidCardState?.getState()?.[item.id];
 if(state?.deleted)return;
 grid.appendChild(api.cardNode({...item,...state,image:window.OrkidCardState?.isStored(state?.image)?"":(state?.image||item.image)},edit));
});
window.OrkidCardState?.apply();
document.dispatchEvent(new Event("orkid-added-cards-rendered"));
})();