const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const cheerio = require("cheerio");

let mainWindow;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 600,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    mainWindow.setMenuBarVisibility(false); // Disable the menu bar

    const indexPath = path.join(__dirname, "index.html");
    mainWindow.loadFile(indexPath);
};

const sendMessage = (message) => {
    if (mainWindow) {
        mainWindow.webContents.send('message', message);
    }
};

const runCli = async () => {
    sendMessage("Choose a .html file containing a <table> tag.");

    try {
        // Open a file dialog to select the HTML file
        const { canceled, filePaths } = await dialog.showOpenDialog({
            properties: ["openFile"],
            filters: [{ name: "HTML Files", extensions: ["html", "htm"] }],
        });

        if (canceled || filePaths.length === 0) {
            sendMessage("Error: No file selected.");
            app.quit();
            return;
        }

        const filePath = filePaths[0];
        sendMessage(`Selected file: ${filePath}`);

        // Open a file dialog to select the output CSV file path
        const { canceled: outputCanceled, filePath: outputPath } = await dialog.showSaveDialog({
            defaultPath: "output.csv",
            filters: [{ name: "CSV Files", extensions: ["csv"] }],
        });

        if (outputCanceled || !outputPath) {
            sendMessage("Error: No output file path selected.");
            app.quit();
            return;
        }

        sendMessage(`Output file path: ${outputPath}`);

        // Load the HTML file
        const html = await fs.promises.readFile(filePath, "utf8");
        const $ = cheerio.load(html);

        // Select the table
        const table = $("table");

        const escapeAndQuote = (value) => `"${value.replace(/"/g, '""')}"`;

        let csv = ""; // Initialize CSV string

        // Iterate through table rows
        table.find("tr").each((_, row) => {
            const cells = $(row)
                .find("th, td")
                .map((_, cell) => {
                    const cellValue = $(cell).text().trim();
                    return escapeAndQuote(cellValue);
                })
                .get();
            csv += cells.join(",") + "\n";
        });

        // Write the CSV to a file
        fs.writeFileSync(outputPath, "\uFEFF" + csv);
        sendMessage(`CSV file has been saved as ${outputPath}`);
    } catch (error) {
        sendMessage(`Error: Something went wrong. Check the file path. ${error.message}`);
    } finally {
        sendMessage("DONE.");
        sendMessage("CLOSE the WINDOW to exit.");
        process.stdin.once("data", () => {
            app.quit();
        });
    }
};

app.on("ready", () => {
    createWindow();
    runCli();
});