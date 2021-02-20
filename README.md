# Highporn

## Requirements:

Node (v14)

Yarn  (Install with: npm install --global yarn)

Chrome or Chromium with Video Support installed

## Installation

Edit the Executable path in the File highporn.js

```javascript
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: {
            width: 1820,
            height: 1080
        },
        executablePath: "/usr/bin/chromium" // -> edit this or use the line below,
        //executablePath: "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        env: false
    });
```

Run

```bash
yarn install
```

## Running

Execute a command

```bash
node highporn.js URL
```

> Make sure to replace URL with a page of a scene
