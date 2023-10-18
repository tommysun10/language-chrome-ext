importScripts('config.js');
function getCurrentTab() {
  return new Promise((resolve, reject) => {
    let queryOptions = { active: true, lastFocusedWindow: true };
    chrome.tabs.query(queryOptions, function (tabs) {
      if (tabs && tabs.length > 0) {
        resolve(tabs[0]);
      } else {
        reject(new Error("No active tab found"));
      }
    });
  });
}

async function translationFunction(selectedLanguage, API_KEY) {
  const style = document.createElement("style");
  style.textContent = `
      .translated-word {
          background-color: yellow;
          border-bottom: 1px dotted black;
      }
      `;
  document.head.append(style);
  await translateTextNodes(document.body, selectedLanguage);
  async function translateTextNodes(node, selectedLanguage) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== "") {
      const words = node.textContent.split(/\s+/);
      let translatedCount = 0;
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (Math.random() < 0.05 && translatedCount < 50) {
          const translation = await getTranslation(
            word,
            selectedLanguage,
            API_KEY
          );
          words[
            i
          ] = `<span class="translated-word" title="${word}">${translation}</span>`;
          translatedCount++;
        }
      }

      const temp = document.createElement("div");
      temp.innerHTML = words.join(" ");

      while (temp.firstChild) {
        node.parentNode.insertBefore(temp.firstChild, node);
      }
      node.parentNode.removeChild(node);
    } else {
      for (const child of Array.from(node.childNodes)) {
        await translateTextNodes(child, selectedLanguage);
      }
    }
  }

  async function getTranslation(text, targetLanguage) {
    console.log("API_KEY: ", API_KEY);
    const url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;
    const body = {
      q: text,
      target: targetLanguage,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return data.data.translations[0].translatedText;
  }
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "translatePage") {
    const tab = await getCurrentTab();
    console.log("config: ", config);
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      args: [message.language, config.API_KEY],
      func: translationFunction,
    });

    sendResponse({ status: "completed" });
  }
});
