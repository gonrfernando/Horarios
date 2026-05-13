document.getElementById('btn').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
        const elements = document.querySelectorAll('div.well');
        return Array.from(elements).map(el => el.outerHTML).join('\n');
        }
    });

    document.getElementById('result').value = result || 'nadota.';
});