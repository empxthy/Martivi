
document.addEventListener("DOMContentLoaded", () => {
    const saveButton = document.getElementById("saveButton");
    const input = document.getElementById("accessKeyInput");
    const status = document.getElementById("status");


    chrome.storage.sync.get(["accessKey", "role"], (data) => {
        if (data.accessKey) {
            
            status.textContent = "Access Key already accepted!";
            status.style.color = '#00cc00';
            input.setAttribute('readonly', true);
            input.placeholder = 'You have already entered Access Key!';

            setTimeout(() => {
                status.innerText = '';
            }, 2000)
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

        fetch('https://my-extension-server.vercel.app/api/validate', {
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
                    input.setAttribute('readonly', true);
                    input.placeholder = 'You have already entered Access Key';

                    chrome.storage.sync.set({ accessKey: access_Key, role: data.role }, () => {
                        console.log("Access Key saved successfully!");
                    });

                    setTimeout(() => {
                        input.value = '';
                        status.style.display = 'none';
                    }, 2000)
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
