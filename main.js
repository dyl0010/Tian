// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron')
const path = require('path')
const fs = require('fs')
const readline = require('readline')
const sqlite3 = require('sqlite3').verbose()

let mainWindow
let loadingWindow
let db

let template = [{
        label: '文件',
        submenu: [{
                type: 'separator'
            },
            {
                label: '退出',
                accelerator: 'CmdOrCtrl+Q',
                click: function() { app.quit() }
            }
        ]
    },
    {
        label: '视图',
        submenu: [{
                label: '刷新',
                accelerator: 'CmdOrCtrl+R',
                click: function(item, focusedWindow) {
                    if (focusedWindow) {
                        if (focusedWindow.id === 1) {
                            BrowserWindow.getAllWindows().forEach(function(win) {
                                if (win.id > 1) { win.close() }
                            })
                        }
                        focusedWindow.reload()
                    }
                }
            },
            {
                label: '开发者工具',
                accelerator: 'Ctrl+Shift+I',
                click: function(item, focusedWindow) {
                    if (focusedWindow) {
                        focusedWindow.toggleDevTools()
                    }
                }
            },
            {
                type: 'separator'
            },
            {
                label: '切换全屏',
                accelerator: 'F11',
                click: function(item, focusedWindow) {
                    if (focusedWindow) {
                        focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
                    }
                }
            }
        ]
    },
    {
        label: '工具',
        submenu: [{
                label: '快捷命令...',
                accelerator: 'CmdOrCtrl+E',
                click: on_commandpanel_clicked
            },
            {
                type: 'separator'
            },
            {
                label: 'coming soon...'
            }
        ]
    },
    {
        label: '窗口',
        role: 'window',
        submenu: [{
                label: '最小化',
                accelerator: 'CmdOrCtrl+M',
                role: 'minimize'
            },
            {
                label: '关闭',
                accelerator: 'CmdOrCtrl+W',
                role: 'close'
            }
        ]
    },
    {
        label: '帮助',
        role: 'help',
        submenu: [{
                label: '更多教程',
                click: function() {
                    shell.openExternal('https://dyl0010.github.io')
                }
            },
            {
                type: 'separator'
            },
            {
                label: '关于',
                click: function() {
                    console.log('about dialog')
                }
            }
        ]
    }
]

//
// command panel  menu item clicked

function on_commandpanel_clicked() {
    console.log('on_commandpanel_clicked')

    mainWindow.webContents.send('request-toggle-commandpanel')
}

ipcMain.on('get-search-result', (event, arg) => {
    console.log('get-search-result: ', arg)

    db.all(`SELECT D_key, B_Key, F_KEY FROM sing_dic WHERE C_key='${arg}'`, [], (err, rows) => {
        if (err) {
            console.log('db: ', err)
            throw err
        }

        if (rows.length == 0) {
            event.returnValue = null
            return
        }

        let word_infos = []

        rows.forEach((row) => {
            word_infos.push([row.D_key, row.B_Key, row.F_key])
        })

        console.log('get-search-result-count: ', word_infos.length)
        event.returnValue = word_infos
    })
})

ipcMain.on('get-word-info', (event, arg) => {
    db.all(`SELECT D_key, B_Key, F_KEY FROM sing_dic WHERE C_key='${arg}'`, [], (err, rows) => {
        if (err) {
            console.log('db: ', err)
            throw err
        }

        if (rows.length == 0) {
            event.returnValue = []
            return
        }

        rows.forEach((row) => {
            const word_info = [row.D_key, row.B_Key, row.F_key]
            console.log(word_info)
            event.returnValue = word_info
        })
    })
})

ipcMain.on('app-init', event => {
    if (loadingWindow) {
        loadingWindow.close()
    }
})

//
// run loading window
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

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        show: false,
        width: 1366,
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

    // open database in memory
    db = new sqlite3.Database('./db/single.db', sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Connected to the disk SQLite database.')
    })

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

    // close the database connection
    db.close((err) => {
        if (err) {
            return console.error(err.message)
        }
        console.log('Close the database connection.')
    })

    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
app.on('ready', function() {
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
})