(() => {
  // src/utils/floatingButton.js
  (function() {
    var button = document.createElement("button");
    button.innerText = "Atlas Xray Loaded";
    button.style.position = "fixed";
    button.style.top = "20px";
    button.style.right = "20px";
    button.style.zIndex = "9999";
    button.style.padding = "10px 18px";
    button.style.background = "#0052cc";
    button.style.color = "#fff";
    button.style.border = "none";
    button.style.borderRadius = "6px";
    button.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
    button.style.fontSize = "16px";
    button.style.cursor = "pointer";
    button.style.fontFamily = "inherit";
    document.body.appendChild(button);
  })();
})();
