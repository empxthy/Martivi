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

        parseButton.addEventListener("click", () => {
            
        });
    }
});  