document.addEventListener("DOMContentLoaded", () => {
    const status = document.getElementById("error-message");
    const pasteLink = document.getElementById("paste__link");
    const parseButton = document.getElementById("parse-button");
    const urlInput = document.getElementById("url-input");

    chrome.storage.sync.get("accessKey", (data) => {
        if (!data.accessKey) {
            status.textContent = "Error! Access Key not found!";
            status.classList.add("error");
            pasteLink.style.display = 'none';
            parseButton.style.display = 'none';
            urlInput.style.display = 'none';

            setTimeout(() => {
                chrome.runtime.openOptionsPage();
            }, 2000);
        } else {
            status.textContent = "";
            status.classList.remove("error");
            parseButton.disabled = false;
            
            parseButton.addEventListener("click", () => {
                fetch('http://localhost:3000/api/validate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ domain: "91.151.136.183" })
                })
                .then((response) => response.json())
                .then((data) => status.textContent = data)
            });
        }
    });
});