console.log("Content script injected successfully", new Date);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "ss_fill" && message.data) {
        const url = message.data;
        const proxyUrl = 'https://corsproxy.io/?';
        const fetchURL = `${proxyUrl}${encodeURIComponent(url)}`;

        fetch(fetchURL)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            const nextDataScript = doc.getElementById('__NEXT_DATA__');

            if (nextDataScript) {
                try {
                    const jsonData = JSON.parse(nextDataScript.textContent);
                    const statement = jsonData.props.pageProps.dehydratedState.queries[0].state.data.data.statement;
                    
                    const images = statement.gallery.map(item => item.image.thumb_webp);
                    
                    fillSSForm({
                        title: doc.querySelector('title').textContent,
                        area: statement.area,
                        city: statement.city_name,
                        address: statement.address,
                        urbanName: statement.district_name,
                        rooms: statement.room_type_id,
                        bedroomsQuantity: statement.bedroom_type_id,
                        bathroomsQuantity: statement.bathroom_type_id,
                        floor: statement.floor,
                        floorQuantity: statement.total_floors,
                        real_estate_type_id: statement.real_estate_type_id,
                        condition_id: statement.condition_id,
                        project_type_id: statement.project_type_id,
                        deal_type_id: statement.deal_type_id,
                        object_status: statement.status_id,
                        images: images
                    });
                    
                    sendResponse({ success: true });
                } catch (error) {
                    console.error("Error parsing JSON:", error);
                    sendResponse({ success: false, error: error.message });
                }
            }
        })
        .catch(error => {
            console.error("Error during fetch:", error);
            sendResponse({ success: false, error: error.message });
        });

        return true;
    }
});

async function fillSSForm(data) {
    const realEstateTypeMapping = {
        1: "ბინა",
        2: "კერძო სახლი", 
        3: "აგარაკი",
        4: "მიწის ნაკვეთი",
        5: "კომერციული",
        6: "სასტუმრო"
    };

    const waitForElement = (selector, timeout = 5000) => {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const checkElement = () => {
                const element = document.querySelector(selector);
                if (element) {
                    resolve(element);
                } else if (Date.now() - startTime > timeout) {
                    reject(new Error(`Element ${selector} not found after ${timeout}ms`));
                } else {
                    setTimeout(checkElement, 100);
                }
            };
            
            checkElement();
        });
    };

    try {
        const estateTypeButtons = document.querySelectorAll('.sc-f90a41ca-3');
        const targetType = realEstateTypeMapping[data.real_estate_type_id];
        
        for (const button of estateTypeButtons) {
            if (button.textContent.trim() === targetType) {
                button.click();
                await new Promise(resolve => setTimeout(resolve, 1000));
                break;
            }
        }

        const dealTypeButtons = document.querySelectorAll('.sc-f90a41ca-3');
        const dealTypeMapping = {
            1: "იყიდება",
            2: "ქირავდება",
            3: "ქირავდება დღიურად",
            4: "გირავდება"
        };
        const targetDeal = dealTypeMapping[data.deal_type_id];
        
        for (const button of dealTypeButtons) {
            if (button.textContent.trim() === targetDeal) {
                button.click();
                await new Promise(resolve => setTimeout(resolve, 1000));
                break;
            }
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        const roomsXPath = '//*[@id="create-app-details"]/div[2]/div[1]/div[2]/div';
        const roomsSection = document.evaluate(roomsXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

        if (roomsSection) {
            const roomButtons = roomsSection.querySelectorAll('.sc-226b651b-0');
            for (const button of roomButtons) {
                const roomText = button.querySelector('p');
                if (roomText && (roomText.textContent === data.rooms.toString() || 
                    (data.rooms >= 8 && roomText.textContent === '8+'))) {
                    button.click();
                    break;
                }
            }
        }

        await new Promise(resolve => setTimeout(resolve, 2000));

        const bedroomsXPath = '//*[@id="create-app-details"]/div[2]/div[2]/div[2]/div';
        const bedroomsSection = document.evaluate(bedroomsXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

        if (bedroomsSection) {
            const bedroomButtons = bedroomsSection.querySelectorAll('.sc-226b651b-0');
            for (const button of bedroomButtons) {
                const bedroomText = button.querySelector('p');
                if (bedroomText && bedroomText.textContent === data.bedroomsQuantity) {
                    button.click();
                    break;
                }
            }
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        const bathroomsXPath = '//*[@id="create-app-details"]/div[2]/div[7]/div[2]/div';
        const bathroomsSection = document.evaluate(bathroomsXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

        if (bathroomsSection) {
            const bathroomButtons = bathroomsSection.querySelectorAll('.sc-226b651b-0');
            for (const button of bathroomButtons) {
                const bathroomText = button.querySelector('p');
                if (bathroomText && bathroomText.textContent === data.bathroomsQuantity) {
                    button.click();
                    break;
                }
            }
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        const statusXPath = '//*[@id="create-app-details"]/div[2]/div[8]/div[2]/div';
        const statusSection = document.evaluate(statusXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

        if (statusSection) {
            console.log('Status data:', data.object_status);
            
            const statusMapping = {
                1: "ძველი აშენებული",
                2: "ახალი აშენებული",
                3: "მშენებარე"
            };

            const statusButtons = '//*[@id="create-app-details"]/div[2]/div[3]/div[2]/div';
            const statusSection = document.evaluate(bathroomsXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            
            
            console.log('Available buttons:', Array.from(statusButtons).map(b => b.textContent));
            
            if(statusSection) {
                const statusButtons = statusSection.querySelectorAll('.sc-226b651b-0');
                for(const button of statusButtons) {
                    const statusText = button.querySelector('p');
                    if (statusText && statusText.textContent === data.condition_id) {
                        console.log('Clicking status:', statusText.textContent);
                        button.click();
                        break;
                    }
                }
            }
        }

        const areaInput = document.querySelector('input[placeholder*="ფართი"]');
        if (areaInput) {
            areaInput.value = data.area;
            areaInput.dispatchEvent(new Event('input', { bubbles: true }));
            areaInput.dispatchEvent(new Event('change', { bubbles: true }));
        }

        const floorInput = document.querySelector('input[placeholder*="სართული"]');
        if (floorInput) {
            floorInput.value = data.floor;
            floorInput.dispatchEvent(new Event('input', { bubbles: true }));
            floorInput.dispatchEvent(new Event('change', { bubbles: true }));
        }

        const totalFloorsInput = document.querySelector('input[placeholder*="სართულიანობა"]');
        if (totalFloorsInput) {
            totalFloorsInput.value = data.floorQuantity;
            totalFloorsInput.dispatchEvent(new Event('input', { bubbles: true }));
            totalFloorsInput.dispatchEvent(new Event('change', { bubbles: true }));
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        const streetInput = document.querySelector('#react-select-5-input');
        if (streetInput) {
            streetInput.value = data.address;
            streetInput.dispatchEvent(new Event('input', { bubbles: true }));
            streetInput.dispatchEvent(new Event('change', { bubbles: true }));
            streetInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        }

        if (data.images && data.images.length > 0) {
            const fileInput = document.querySelector('.lgjkBz input[type="file"]');
            const dropZone = document.querySelector('.lgjkBz');
            
            if (fileInput && dropZone) {
                const dataTransfer = new DataTransfer();
                
                await Promise.all(data.images.map(async url => {
                    const proxyUrl = 'https://cors-allow-cce7a54ca846.herokuapp.com/';
                    const fullUrl = proxyUrl + url;
                    
                    try {
                        const response = await fetch(fullUrl, {
                            headers: {
                                'Origin': window.location.origin,
                                'X-Requested-With': 'XMLHttpRequest'
                            }
                        });
                        
                        const blob = await response.blob();
                        const fileName = url.split('/').pop();
                        const file = new File([blob], fileName, { type: 'image/webp' });
                        dataTransfer.items.add(file);
                    } catch (error) {
                        console.error('Error loading image:', url, error);
                    }
                }));

                const dropEvent = new DragEvent('drop', {
                    bubbles: true,
                    cancelable: true,
                    dataTransfer: dataTransfer
                });

                dropZone.dispatchEvent(dropEvent);

                fileInput.files = dataTransfer.files;
                fileInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }

    } catch (error) {
        console.error('Error filling SS form:', error);
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "myhome_fill" && message.data) {
        const url = message.data;
        const proxyUrl = 'https://corsproxy.io/?';
        const fetchURL = `${proxyUrl}${encodeURIComponent(url)}`;

        console.log('Fetching URL:', fetchURL);

        fetch(fetchURL)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            const nextDataScript = doc.getElementById('__NEXT_DATA__');

            if (nextDataScript) {
                try {
                    const jsonData = JSON.parse(nextDataScript.textContent);
                    const statement = jsonData.props.pageProps.dehydratedState.queries[0].state.data.data.statement;
                    
                    const images = statement.gallery.map(item => item.image.thumb_webp);
                    
                    fillMyHomeForm({
                        title: doc.querySelector('title').textContent,
                        area: statement.area,
                        city: statement.city_name,
                        address: statement.address,
                        urbanName: statement.district_name,
                        rooms: statement.room_type_id,
                        bedroomsQuantity: statement.bedroom_type_id,
                        bathroomsQuantity: statement.bathroom_type_id,
                        floor: statement.floor,
                        floorQuantity: statement.total_floors,
                        real_estate_type_id: statement.real_estate_type_id,
                        project_type_id: statement.project_type_id,
                        deal_type_id: statement.deal_type_id,
                        object_status: statement.status_id,
                        images: images
                    });
                    
                    sendResponse({ success: true });
                } catch (error) {
                    console.error("Error parsing JSON:", error);
                    sendResponse({ success: false, error: error.message });
                }
            }
        })
        .catch(error => {
            console.error("Error during fetch:", error);
            sendResponse({ success: false, error: error.message });
        });

        return true;
    }
});

async function fillMyHomeForm(data) {
    const realEstateTypeMapping = {
        1: "ბინა",
        2: "კერძო სახლი",
        3: "აგარაკი",
        4: "მიწის ნაკვეთი",
        5: "კომერციული ფართი",
        6: "სასტუმრო"
    };

    const dealTypeMapping = {
        1: "იყიდება",
        2: "ქირავდება",
        3: "ქირავდება დღიურად",
        4: "გირავდება"
    };

    const waitForElement = (selector, timeout = 5000) => {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const checkElement = () => {
                const element = document.querySelector(selector);
                if (element) {
                    resolve(element);
                } else if (Date.now() - startTime > timeout) {
                    reject(new Error(`Element ${selector} not found after ${timeout}ms`));
                } else {
                    setTimeout(checkElement, 100);
                }
            };
            
            checkElement();
        });
    };

    const waitForXPath = (xpath, timeout = 5000) => {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const checkElement = () => {
                const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                if (element) {
                    resolve(element);
                } else if (Date.now() - startTime > timeout) {
                    reject(new Error(`Element ${xpath} not found after ${timeout}ms`));
                } else {
                    setTimeout(checkElement, 100);
                }
            };
            
            checkElement();
        });
    };

    try {
        const estateTypeLabels = document.querySelectorAll('.luk-text-xs.md\\:luk-text-sm.luk-font-regular');
        const targetType = realEstateTypeMapping[data.real_estate_type_id];
        
        for (const label of estateTypeLabels) {
            if (label.textContent.trim() === targetType) {
                const parentLabel = label.closest('label');
                if (parentLabel) {
                    parentLabel.click();
                    await new Promise(resolve => setTimeout(resolve, 500));
                    break;
                }
            }
        }

        const dealTypeLabels = await waitForElement('.luk-text-xs.md\\:luk-text-sm.luk-font-regular');
        const targetDeal = dealTypeMapping[data.deal_type_id];
        
        document.querySelectorAll('.luk-text-xs.md\\:luk-text-sm.luk-font-regular').forEach(label => {
            if (label.textContent.trim() === targetDeal) {
                const parentLabel = label.closest('label');
                if (parentLabel) {
                    parentLabel.click();
                }
            }
        });

        await new Promise(resolve => setTimeout(resolve, 500));
        const roomsXPath = '//*[@id="1"]/div[2]/div/div[2]/div';
        const roomsSection = await waitForXPath(roomsXPath, 10000);

        if (roomsSection) {
            const roomLabels = roomsSection.querySelectorAll('label');
            for (const label of roomLabels) {
                const roomText = label.querySelector('span.luk-text-xs.md\\:luk-text-sm.luk-font-regular');
                if (roomText && roomText.textContent.trim() === data.rooms.toString()) {
                    label.click();
                    break;
                }
            }
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        const bedroomsXPath = '//*[@id="1"]/div[2]/div/div[4]/div/div';
        const bedroomsSection = await waitForXPath(bedroomsXPath, 10000);

        if (bedroomsSection) {
            const labels = bedroomsSection.querySelectorAll('label');
            for (const label of labels) {
                if (label.textContent.trim() === data.bedroomsQuantity) {
                    label.click();
                    break;
                }
            }
        }

        const areaXPath = '//*[@id="2"]/div[3]/div[2]/div/div[1]/div/label';
        const areaLabel = document.evaluate(areaXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

        if (areaLabel) {
            const input = areaLabel.querySelector('input[inputmode="decimal"]');
            if (input) {
                input.value = data.area;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }

        const floorInput = document.querySelector('input[id^=":r"][placeholder=" "][inputmode="numeric"]');
        if (floorInput && floorInput.closest('label').querySelector('span').textContent.includes('სართული')) {
            floorInput.value = data.floor;
            floorInput.dispatchEvent(new Event('input', { bubbles: true }));
            floorInput.dispatchEvent(new Event('change', { bubbles: true }));
        }

        const totalFloorsXPath = '//*[@id="1"]/div[2]/div/div[8]/div[2]/div/label';
        const totalFloorsLabel = await waitForXPath(totalFloorsXPath, 10000);

        if (totalFloorsLabel) {
            const input = totalFloorsLabel.querySelector('input[inputmode="numeric"]');
            if (input) {
                input.value = data.floorQuantity;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }

        const bathroomXPath = '//*[@id="1"]/div[2]/div/div[6]/div/div/div';
        const bathroomSection = await waitForXPath(bathroomXPath, 10000);
        if (bathroomSection) {
            bathroomSection.click();
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const bathroomOptions = document.querySelectorAll('.options-list li');
            for (const option of bathroomOptions) {
                if (option.textContent.trim() === data.bathroomsQuantity) {
                    option.click();
                    break;
                }
            }
        }

        await new Promise(resolve => setTimeout(resolve, 500));
        const citySelect = document.querySelector('.luk-custom-select input');
        if (citySelect) {
            citySelect.value = data.city;
            citySelect.dispatchEvent(new Event('input', { bubbles: true }));
            citySelect.dispatchEvent(new Event('change', { bubbles: true }));
        }

        const addressInput = document.querySelector('input[placeholder=" "]');
        if (addressInput) {
            addressInput.value = data.address;
            addressInput.dispatchEvent(new Event('input', { bubbles: true }));
            addressInput.dispatchEvent(new Event('change', { bubbles: true }));
        }

        if (data.images && data.images.length > 0) {
            const fileInput = document.querySelector('input[type="file"][accept=".jpg,.png,.jpeg,.webp"]');
            if (fileInput) {
                const dataTransfer = new DataTransfer();
                
                await Promise.all(data.images.map(async url => {
                    const proxyUrl = 'https://cors-allow-cce7a54ca846.herokuapp.com/';
                    const fullUrl = proxyUrl + url;
                    
                    try {
                        const response = await fetch(fullUrl, {
                            headers: {
                                'Origin': window.location.origin,
                                'X-Requested-With': 'XMLHttpRequest'
                            }
                        });
                        
                        const blob = await response.blob();
                        const fileName = url.split('/').pop();
                        const file = new File([blob], fileName, { type: 'image/webp' });
                        dataTransfer.items.add(file);
                    } catch (error) {
                        console.error('Error loading image:', url, error);
                    }
                }));

                fileInput.files = dataTransfer.files;
                fileInput.dispatchEvent(new Event('change', { bubbles: true }));
                
                console.log('Images loaded:', dataTransfer.files.length);
            }
        }

        const statusXPath = '//*[@id="1"]/div[2]/div/div[10]/div/div/div';
        const statusSection = await waitForXPath(statusXPath, 10000);
        if (statusSection) {
            statusSection.click();
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const statusMapping = {
                1:"ძველი აშენებული",
                2:"ახალი აშენებული",
                3:"მშენებარე",
                4:"სასოფლო-სამეურნეო",
                5:"არასასოფლო",
                6:"კომერციული",
                7:"სპეციალური",
                8:"საოფისე",
                9:"სავაჭრო",
                10:"სასაწყობე",
                11:"საწარმოო",
                12:"კვების ობიექტი",
                13:"ავტოფარეხი",
                18:"საინვესტიციო",
                23:"დასრულებული",
                24:"უნივერსალური",
                25:"სარდაფი",
                26:"ნახევარსარდაფი",
                27:"მთლიანი შენობა",
                28:"ავტოსამრეცხაო",
                29:"ავტოსერვისი",
                30:"ფერმა"
            };
            
            console.log('Status data:', data.object_status);
            console.log('Mapped status:', statusMapping[data.object_status]);
            
            const waitForOptions = () => {
                return new Promise((resolve) => {
                    const check = () => {
                        const options = document.querySelectorAll('.options-list li');
                        if (options.length > 0) {
                            resolve(options);
                        } else {
                            setTimeout(check, 100);
                        }
                    };
                    check();
                });
            };

            const statusOptions = await waitForOptions();
            console.log('Found options:', statusOptions.length);
            
            for (const option of statusOptions) {
                const optionText = option.textContent.trim();
                console.log('Comparing:', optionText, 'with', statusMapping[data.object_status]);
                if (optionText === statusMapping[data.object_status]) {
                    console.log('Found matching option, clicking...');
                    await new Promise(resolve => setTimeout(resolve, 100));
                    option.click();
                    break;
                }
            }
        }
    } catch (error) {
        console.error('Error filling form:', error);
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "unipro_fill" && message.data) {
        const url = message.data;
        const proxyUrl = 'https://corsproxy.io/?';
        const fetchURL = `${proxyUrl}${encodeURIComponent(url)}`;

        console.log('Fetching URL:', fetchURL);

        fetch(fetchURL)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            const nextDataScript = doc.getElementById('__NEXT_DATA__');

            if (nextDataScript) {
                try {
                    const jsonData = JSON.parse(nextDataScript.textContent);
                    const statement = jsonData.props.pageProps.dehydratedState.queries[0].state.data.data.statement;
                    
                    const images = statement.gallery.map(item => item.image.thumb_webp);
                    console.log('Found images:', images);
                    
                    fillUniproForm({
                        title: doc.querySelector('title').textContent,
                        area: statement.area,
                        city: statement.city_name,
                        address: statement.address,
                        urbanName: statement.district_name,
                        rooms: statement.room_type_id,
                        bedroomsQuantity: statement.bedroom_type_id,
                        bathroomsQuantity: statement.bathroom_type_id,
                        floor: statement.floor,
                        floorQuantity: statement.total_floors,
                        real_estate_type_id: statement.real_estate_type_id,
                        condition_id: statement.condition_id,
                        project_type_id: statement.project_type_id,
                        deal_type_id: statement.deal_type_id,
                        object_status: statement.estate_status_types,
                        images: images
                    });
                } catch (error) {
                    console.error("Error parsing JSON:", error);
                }
            }
        })
        .catch(error => {
            console.error("Error during fetch:", error);
        });

    return true;
    }
});

async function fillUniproForm(data) {
    const realEstateType = document.querySelector('select[name="real_estate_type"]');
    if (realEstateType) {
        const estateTypeMapping = {
            1: "1",
            2: "2",
            3: "3",
            4: "4",
            5: "5",
            6: "6"
        };

        if(data.real_estate_type_id == 5) {
            realEstateType.value = "3";
            realEstateType.dispatchEvent(new Event('change', { bubbles: true }));
        }
        else{
            realEstateType.value = estateTypeMapping[data.real_estate_type_id] || "1";
            realEstateType.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    const dealType = document.querySelector('select[name="deal_type"]');
    if (dealType) {
        const dealTypeMapping = {
            1: "1",
            2: "2",
            3: "3",
            4: "4",
        };
        dealType.value = dealTypeMapping[data.deal_type_id] || "1";
        dealType.dispatchEvent(new Event('change', { bubbles: true }));
    }

    const objectStatus = document.querySelector('select[name="object_status"]');
    if (objectStatus) {
        const objectStatusMapping = {
            "1":"ძველი აშენებული",
            "2":"ახალი აშენებული",
            "3":"მშენებარე",
            "4":"სასოფლო-სამეურნეო",
            "5":"არასასოფლო",
            "6":"კომერციული",
            "7":"სპეციალური",
            "8":"საოფისე",
            "9":"სავაჭრო",
            "10":"სასაწყობე",
            "11":"საწარმოო",
            "12":"კვების ობიექტი",
            "13":"ავტოფარეხი",
            "18":"საინვესტიციო",
            "23":"დასრულებული",
            "24":"უნივერსალური",
            "25":"სარდაფი",
            "26":"ნახევარსარდაფი",
            "27":"მთლიანი შენობა",
            "28":"ავტოსამრეცხაო",
            "29":"ავტოსერვისი",
            "30":"ფერმა"
        }
        objectStatus.value = objectStatusMapping[data.object_status] || "2";
        objectStatus.dispatchEvent(new Event('change', { bubbles: true }));
    }

    const objectCondition = document.querySelector('select[name="object_condition"]');
    if (objectCondition) {
        const conditionMapping = {
            "1":"დასრულებული რემონტით",
            "2":"მწვანე კარკასი",
            "3":"შავი კარკასი",
            "4":"თეთრი კარკასი",
            "5":"ნაკვეთთან მიყვანილი კომუნიკაციით",
            "6":"დამტკიცებული პროექტით",
            "7":"დამტკიცებული პროექტი - კომუნიკაციით"
        };
        objectCondition.value = conditionMapping[data.condition_id] || "1";
        objectCondition.dispatchEvent(new Event('change', { bubbles: true }));
    }

    const propertyProject = document.querySelector('select[name="property_project"]');
    if (propertyProject) {
        const projectMapping = {
            1: "8",
            2: "3",
            3: "10",
            4: "2",
            5: "7",
            6: "5",
            7: "9",
            8: "1" 
        };
        propertyProject.value = projectMapping[data.project_type_id] || "1";
        propertyProject.dispatchEvent(new Event('change', { bubbles: true }));
    }

    const smpAdapted = document.querySelector('input[name="is_smp_adapted"]');
    if (smpAdapted) {
        smpAdapted.checked = false;
        smpAdapted.dispatchEvent(new Event('change', { bubbles: true }));
    }

    const citySelect = document.querySelector('select[name="city_id"]');
    if (citySelect) {
        const cityMapping = {
            'თბილისი': "1",
            'ბათუმი': "2",
            'ქუთაისი': "3",
            'რუსთავი': "4",
            'გორი': "5",
            'ზუგდიდი': "6",
            'ფოთი': "7",
            'ქობულეთი': "8",
            'ხაშური': "9",
            'სამტრედია': "10",
            'სენაკი': "11",
            'ზესტაფონი': "12",
            'მარნეული': "13",
            'თელავი': "14",
            'ახალციხე': "15",
            'ოზურგეთი': "16",
            'კასპი': "17",
            'ჭიათურა': "18",
            'წყალტუბო': "19",
            'საგარეჯო': "20",
            'გარდაბანი': "21",
            'ბორჯომი': "22",
            'ტყიბული': "23",
            'ხონი': "24",
            'ბოლნისი': "25",
            'ახალქალაქი': "26",
            'გურჯაანი': "27",
            'მცხეთა': "28",
            'ყვარელი': "29",
            'ახმეტა': "30"
        };
        citySelect.value = cityMapping[data.city] || "1";
        citySelect.dispatchEvent(new Event('change', { bubbles: true }));
    }

    if (data.city === 'თბილისი') {
        const districtSelect = document.querySelector('select[name="district_id"]');
        if (districtSelect) {
            const districtOption = Array.from(districtSelect.options).find(option => 
                data.urbanName && option.text.trim().includes(data.urbanName.trim())
            );
            if (districtOption) {
                districtSelect.value = districtOption.value;
                districtSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
    }

    const addressInput = document.querySelector('input[name="address"]');
    if (addressInput) {
        addressInput.value = data.address;
        addressInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    const fullSpaceInput = document.querySelector('input[name="full_space"]');
    if (fullSpaceInput) {
        fullSpaceInput.value = data.area;
        fullSpaceInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    const floorInput = document.querySelector('input[name="floor"]');
    if (floorInput) {
        floorInput.value = data.floor;
        floorInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    const totalFloorInput = document.querySelector('input[name="total_floor"]');
    if (totalFloorInput) {
        totalFloorInput.value = data.floorQuantity;
        totalFloorInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    const roomsInput = document.querySelector('input[name="rooms"]');
    if (roomsInput) {
        roomsInput.value = data.rooms;
        roomsInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    const bedroomInput = document.querySelector('input[name="bedroom"]');
    if (bedroomInput) {
        bedroomInput.value = data.bedroomsQuantity;
        bedroomInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    const bathroomsInput = document.querySelector('input[name="bathrooms"]');
    if (bathroomsInput) {
        bathroomsInput.value = data.bathroomsQuantity;
        bathroomsInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    if (data.images && data.images.length > 0) {
        const dropContainer = document.querySelector('.drop-container');
        const fileInput = document.querySelector('input[name="upload[]"].user_picked_files');
        
        if (dropContainer && fileInput) {
            Promise.all(data.images.map(url => {
                const proxyUrl = 'https://cors-allow-cce7a54ca846.herokuapp.com/';
                const fullUrl = proxyUrl + url;
                
                return fetch(fullUrl, {
                    headers: {
                        'Origin': window.location.origin,
                        'X-Requested-With': 'XMLHttpRequest'
                    }

                })
                .then(response => response.blob())
                .then(blob => {
                    const fileName = url.split('/').pop();
                    return new File([blob], fileName, { type: 'image/webp' });
                });
            })).then(files => {
                const dataTransfer = new DataTransfer();
                files.forEach(file => dataTransfer.items.add(file));
                
                const dropEvent = new DragEvent('drop', { 
                    bubbles: true,
                    cancelable: true,
                    dataTransfer: dataTransfer
                });
                
                dropContainer.dispatchEvent(dropEvent);
                
                fileInput.files = dataTransfer.files;
                fileInput.dispatchEvent(new Event('change', { bubbles: true }));
                
                console.log('Files dropped:', files.length);
            }).catch(error => {
                console.error('Error loading images:', error);
            });
        }
    }
}