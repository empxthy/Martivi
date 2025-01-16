document.addEventListener("DOMContentLoaded", () => {
    const status = document.getElementById("error-message");
    const pasteLink = document.getElementById("paste__link");
    const parseButton = document.getElementById("parse-button");
    const urlInput = document.getElementById("url-input");

    chrome.storage.sync.get("accessKey", (data) => {
        const userKey = data.accessKey;

        if (!userKey) {
            status.textContent = "Error: Access Key not inserted!";
            status.classList.add("error");
            pasteLink.style.display = 'none';
            parseButton.style.display = 'none';
            urlInput.style.display = 'none';

            setTimeout(() => {
                chrome.runtime.openOptionsPage();
            }, 2000);
            return;
        }
        else {
            enableFunctionality();
        }
    });

    function enableFunctionality() {
        status.textContent = "";
        status.classList.remove("error");
        parseButton.disabled = false;
    }

    parseButton.addEventListener('click', () => {
        const url = urlInput.value.trim();
    
        if (!url) {
            alert("Insert LINK!");
            return;
        }
    
        fillMyHome(url);
        fillUnipro(url);
        fillSS(url);
    });
    
    const fillMyHome = (data) => {
        chrome.tabs.query(
            {
                url: "https://statements.myhome.ge/ka/statement/create*",
                currentWindow: true
            },
            (tabs) => {
                if (tabs.length === 0) {
                    console.warn("No matching tabs found for MyHome.");
                    return;
                }
    
                const tabId = tabs[0]?.id;
                if (tabId !== undefined) {
                    chrome.tabs.sendMessage(
                        tabId,
                        { action: "myhome_fill", data: data },
                        (response) => {
                            if (chrome.runtime.lastError) {
                                console.error("Error sending message to MyHome tab:", chrome.runtime.lastError.message);
                            } else {
                                console.log("MyHome form filled:", response);
                            }
                        }
                    );
                }
            }
        );
    };
    
    const fillUnipro = (data) => {
        chrome.tabs.query(
            {
                url: "https://unipro.ge/user/properties/create",
                currentWindow: true
            },
            (tabs) => {
                if (tabs.length === 0) {
                    console.warn("No matching tabs found for Unipro.");
                    return;
                }
    
                const tabId = tabs[0]?.id;
                if (tabId !== undefined) {
                    chrome.tabs.sendMessage(
                        tabId,
                        { action: "unipro_fill", data: data },
                        (response) => {
                            if (chrome.runtime.lastError) {
                                console.error("Error sending message to Unipro tab:", chrome.runtime.lastError.message);
                            } else {
                                console.log("Unipro form filled:", response);
                            }
                        }
                    );
                }
            }
        );
    };
    
    const fillSS = (data) => {
        chrome.tabs.query(
            {
                url: "https://home.ss.ge/ka/udzravi-qoneba/create",
                currentWindow: true
            },
            (tabs) => {
                if (tabs.length === 0) {
                    console.warn("No matching tabs found for SS.GE.");
                    return;
                }
    
                const tabId = tabs[0]?.id;
                if (tabId !== undefined) {
                    chrome.tabs.sendMessage(
                        tabId,
                        { action: "ss_fill", data: data },
                        (response) => {
                            if (chrome.runtime.lastError) {
                                console.error("Error sending message to SS tab:", chrome.runtime.lastError.message);
                            } else {
                                console.log("SS form filled:", response);
                            }
                        }
                    );
                }
            }
        );
    };
});  