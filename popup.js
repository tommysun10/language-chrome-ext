document
  .getElementById("translate")
  .addEventListener("click", async function () {
    const language = document.getElementById("language").value;
    const translateButton = document.getElementById("translate");
    translateButton.innerHTML = "Translating..."; // Add feedback that translation is in progress
    translateButton.disabled = true; // Disable the button while translating

    chrome.runtime.sendMessage(
      { action: "translatePage", language: language },
      function (response) {
        translateButton.innerHTML = "Translate Words"; // Reset the button text
        translateButton.disabled = false; // Enable the button again
      }
    );
  });
