document
  .getElementById("translate")
  .addEventListener("click", async function () {
    const language = document.getElementById("language").value;
    const translateButton = document.getElementById("translate");
    translateButton.innerHTML = "Translating...";
    translateButton.disabled = true;

    chrome.runtime.sendMessage(
      { action: "translatePage", language: language },
      function (response) {
        translateButton.innerHTML = "Translate Words";
        translateButton.disabled = false;
      }
    );
  });
