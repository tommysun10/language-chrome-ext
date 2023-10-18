const API_KEY = ""
async function translationFunction(selectedLanguage, API_KEY) {
  const WORDS_TO_TRANSLATE = 5
  const PROBABILITY_OF_TRANSLATION = 0.05


  const uniqueWordsToTranslate = []
  let uniqueTranslatedWords = []
  const seenWords = new Set()
  let translatedCount = 0;
  const uniqueSplitter = "|.|"
  const languageDictionary = {}

  getUniqueWordsToTranslate(document.body);
  await getTranslation(uniqueWordsToTranslate.join(uniqueSplitter), selectedLanguage)
  createLanguageMapping()
  replaceAllWords(document.body)

  function getUniqueWordsToTranslate(node) {
    const allWordNodes = textNodesUnder(node)
      for (let node of allWordNodes) {
        for (let word of node.nodeValue.split(" ")) {
          if (Math.random() < PROBABILITY_OF_TRANSLATION && translatedCount < WORDS_TO_TRANSLATE && !seenWords.has(word.toLowerCase())) {
            translatedCount += 1;
            uniqueWordsToTranslate.push(word)
            seenWords.add(word.toLowerCase())
          }
        }
      }
  }

  function textNodesUnder(el) {
    var n, a = [], walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    while (n = walk.nextNode()) a.push(n);

    return a.filter(n => n.nodeValue).map((n) => {
      n.nodeValue = n.nodeValue.replace("\n", "").trim()
      return n
    }).filter(n => n.nodeValue)
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
    const fullText = data.data.translations[0].translatedText;
    uniqueTranslatedWords = fullText.replaceAll(" ", "").split(uniqueSplitter)
  }

  function createLanguageMapping() {
    for (let i = 0; i < uniqueWordsToTranslate.length; i++) {
      languageDictionary[uniqueWordsToTranslate[i]] = uniqueTranslatedWords[i]
    }
  }

  function replaceAllWords(node) {
    const allWordNodes = textNodesUnder(node)
      for (let node of allWordNodes) {
        let newNodeValue = ""
        for (let word of node.nodeValue.split(" ")) {
          const wordToAdd = word in languageDictionary ? languageDictionary[word] : word
          newNodeValue = newNodeValue + " " + wordToAdd
        }
        node.nodeValue = newNodeValue
      }
  }
}

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

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "translatePage") {
    const tab = await getCurrentTab();
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      args: [message.language, API_KEY],
      func: translationFunction,
    });

    sendResponse({ status: "completed" });
  }
});
