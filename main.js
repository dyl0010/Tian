// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const sqlite3 = require('sqlite3').verbose()

let mainWindow
let loadingWindow

ipcMain.on('app-init', event => {
    if (loadingWindow) {
        setTimeout(() => {
            loadingWindow.close()
        }, 3000);
    }
})

function createLoadingWindow() {
    loadingWindow = new BrowserWindow({
        width: 400,
        height: 300,
        frame: false,
        resizable: false,
        backgroundColor: '#FFF',
        alwaysOnTop: true,
        show: false
    })

    loadingWindow.loadFile('./splash.html')

    loadingWindow.on('closed', () => {
        loadingWindow = null
        mainWindow.show()
    })

    loadingWindow.once('ready-to-show', () => {
        loadingWindow.show()
        createWindow()
    })
}

// open database in memory
let db = new sqlite3.Database('./db/test.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the in-memory SQLite database.')
})

db.all(`SELECT Units FROM lex86 WHERE Kanji='愿'`, [], (err, rows) => {
    if (err) {
        throw err
    }

    rows.forEach((row) => {
        console.log(row.Units)
    })
})

// close the database connection
db.close((err) => {
    if (err) {
        return console.error(err.message)
    }
    console.log('Close the database connection.')
})

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        show: false,
        width: 1024,
        height: 768,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        }
    })

    // and load the index.html of the app.
    mainWindow.loadFile('index.html')

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    mainWindow.once('ready-to-show', () => {
        // mainWindow.show()
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createLoadingWindow()

    app.on('activate', function() {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createLoadingWindow()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.