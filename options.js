document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("accessKey");
    const saveButton = document.getElementById("save");
    const status = document.getElementById("status");

    chrome.storage.sync.get("accessKey", (data) => {
        if (data.accessKey) {
            input.value = data.accessKey;
            status.style.color = 'green';
            status.textContent = "Access Key is saved already";
        }
    });

    saveButton.addEventListener("click", () => {
        const accessKey = input.value.trim();
        if (accessKey === "") {
            status.style.color = '#ff0000';
            status.textContent = "Input Access Key!";
            status.classList.add("error");
            return;
        }

        chrome.storage.sync.set({ accessKey }, () => {
            status.style.color = 'green';
            status.textContent = "Access Key saved successfully!";
            status.classList.remove("error");
            input.value = "";
        });
    });
});
