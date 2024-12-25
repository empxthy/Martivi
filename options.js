

document.addEventListener("DOMContentLoaded", () => {
    const saveButton = document.getElementById("saveButton");
    const input = document.getElementById("accessKeyInput");
    const status = document.getElementById("status");

    chrome.storage.sync.get("accessKey", (data) => {
        if (data.accessKey) {
            status.textContent = "Access Key already accepted!";
            status.style.color = '#00cc00';
        }
    });

    saveButton.addEventListener("click", () => {
        const access_Key = input.value.trim();

        if (access_Key === "") {
            status.style.color = '#ff0000';
            status.textContent = "Input Access Key!";
            status.classList.add("error");
            return;
        }

        fetch('http://localhost:3000/rest/v2/api/validate', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ accessKey: access_Key })
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);

                if (data.isValid) {
                    status.style.color = '#00cc00';
                    status.textContent = data.message;
                    status.classList.remove("error");

                    chrome.storage.sync.set({ accessKey: access_Key }, () => {
                        console.log("Access Key saved successfully!");
                    });

                    setTimeout(() => {
                        input.value = '';
                        status.style.display = 'none';
                    }, 2000)

                    setTimeout(() => {
                        window.close();
                    }, 5000)
                } else {
                    status.style.color = '#ff0000';
                    status.textContent = data.message;
                    status.classList.add("error");
                }
            })
            .catch((error) => {
                console.error(error);

                if (error.response && error.response.data && error.response.data.message) {
                    status.style.color = '#ff0000';
                    status.textContent = error.response.data.message;
                } else {
                    status.style.color = '#ff0000';
                    status.textContent = "An error occurred!";
                }

                status.classList.add("error");
            });
    });
});
