(() => {
  "use strict";
  const here = location.href;
  const KEY = "orkid-navigation-last-url";
  const RETURN_KEY = "orkid-navigation-return-url";
  let previous = null;
  try {
    const ref = document.referrer && new URL(document.referrer);
    if (ref && ref.href !== here && (ref.origin === location.origin || (ref.protocol === "file:" && location.protocol === "file:"))) previous = ref.href;
    if (!previous) {
      const stored = sessionStorage.getItem(KEY);
      if (stored && stored !== here && new URL(stored).protocol === location.protocol) previous = stored;
    }
    if (previous) sessionStorage.setItem(RETURN_KEY, previous);
    sessionStorage.setItem(KEY, here);
  } catch (err) { console.warn("Navigation history unavailable", err); }
  function goBack(event) {
    event?.preventDefault(); event?.stopImmediatePropagation();
    const prev = previous || sessionStorage.getItem(RETURN_KEY);
    if (prev && prev !== here) {
      try { sessionStorage.setItem(KEY, here); sessionStorage.removeItem(RETURN_KEY); } catch {}
      location.assign(prev);
      return;
    }
    if (history.length > 1 && document.referrer) { history.back(); return; }
    location.assign("./index.html");
  }
  document.querySelectorAll(".education-back,.drawing-back,#backButton,.back-button,[data-orkid-back]").forEach(el => el.addEventListener("click", goBack, true));
  window.orkidGoBack = goBack;
})();
