console.log('search.js loaded...')

const { ipcRenderer } = require('electron')

const command_panel = document.getElementById('search-panel-layout')
const search_bar = document.getElementById('search-bar')

const search_result_list = document.getElementById('search-result-list')
const recently_list = document.getElementById('recently-list')
const frequency_list = document.getElementById('frequency-list')

const WORD_SRC = 0
const WORD_ROOTS = 1
const WORD_CODES = 2
const WORD_PIN = 3

const max_recently = 5

let recently_infos = []

//
// `search bar` event handlers

function handle_input(event) {
    // console.log('input: ', event.target.value)
    const input = event.target.value

    if (input === '') {
        clear_last_search_results()
    }
}

function handle_compositionstart(event) {

}

function handle_compositionupdate(event) {
    // console.log('update', event.target.value)
}

function handle_compositionend(event) {
    const search_src = event.target.value;
    console.log(search_src)

    const results = ipcRenderer.sendSync('get-search-result', search_src)

    clear_last_search_results()

    if (results) {
        if (results.length === 0) {
            print_not_found(search_src)
        } else {
            for (let i = 0; i < results.length; ++i) {
                let info = results[i]
                info.unshift(search_src)
                clean_delimiter(info)
                append_item(info, search_result_list)

                if (i === (results.length - 1)) {
                    update_recently(info)
                }
            }
        }
    }
}

//
// currently, remove `〔` and `〕` in word-roots

function clean_delimiter(info) {
    if (info[WORD_ROOTS].length > 1) {
        info[WORD_ROOTS] = info[WORD_ROOTS].slice(1, info[WORD_ROOTS].length - 1)
    }
    console.log('clean: ', info[WORD_ROOTS])
}

//
// update recently list

function update_recently(info) {
    if (recently_infos.indexOf(info[WORD_SRC]) !== -1) {
        console.log('recently list exist.')
        return
    }

    if (recently_infos.length >= max_recently) {
        recently_infos.pop()
        recently_list.removeChild(recently_list.lastChild)
    }

    recently_infos.push(info[WORD_SRC])
    append_item(info, recently_list)
}

//
// register `search bar` event handlers

function register_listener() {
    search_bar.addEventListener('input', handle_input)
    search_bar.addEventListener('compositionstart', handle_compositionstart)
    search_bar.addEventListener('compositionupdate', handle_compositionupdate)
    search_bar.addEventListener('compositionend', handle_compositionend)
}

//
// print not found

function print_not_found(current_src) {
    console.log(current_src, '未找到')
}

//
// clear last search results

function clear_last_search_results() {
    search_result_list.innerHTML = ''
}

//
// append_item

function append_item(word_info, parent) {
    const search_info =
        `<li class="search-result-item">
            <div class="search-src">
                <span class="search-word">${word_info[WORD_SRC]}</span>
                <span class="search-word-tag"></span>
            </div>
            <div class="search-info">
                <span class="search-word-roots">${word_info[WORD_ROOTS]}</span>
                <span class="search-word-roots-tag"> | 字根</span>
                <span class="search-word-codes">${word_info[WORD_CODES]}</span>
                <span class="search-word-codes-tag"> | 编码</span>
                <span class="search-word-pin">${word_info[WORD_PIN]}</span>
                <span class="search-word-pin-tag"> | 拼音</span>
            </div>
        </li>`

    parent.insertAdjacentHTML('afterbegin', search_info)
}

//
// toggle command panel

function toggle_search() {
    command_panel.style.visibility =
        (command_panel.style.visibility === 'hidden') ? 'visible' : 'hidden'
}

//
// hide command panel

function hide_search() {
    command_panel.style.visibility = 'hidden'
}

//
// entry point

// register_search()

function fill_test() {
    for (let i = 0; i < 5; ++i) {
        append_item(['愿', '厂白小心', 'drin ', 'yuàn'], search_result_list)
    }

    for (let i = 0; i < 3; ++i) {
        append_item(['愿', '厂白小心', 'drin ', 'yuàn'], recently_list)
    }

    for (let i = 0; i < 2; ++i) {
        append_item(['愿', '厂白小心', 'drin ', 'yuàn'], frequency_list)
    }
}

// fill_test()

module.exports = {
    fill_test,
    register_listener,
    toggle_search,
    hide_search
}