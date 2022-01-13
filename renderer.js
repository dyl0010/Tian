// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const { ipcRenderer } = require('electron')

setTimeout(() => {
    ipcRenderer.send('app-init')
}, 3000);

let text = '愿中国青年都摆脱冷气，只是向上走，不必听自暴自弃者流的话。能做事的做事，能发声的发声。有一分热，发一分光。'
let two_radical = '二亠人儿入八冂冖冫几凵刀力勹匕匚匸十卜卩厂厶又'

// ----------------------------------------------------------------------------
// fill word progress

const words_radical = document.getElementById('words-radical')

fill_radical()

function fill_radical() {
    for (let i = 0; i < two_radical.length; ++i) {
        words_radical.insertAdjacentHTML('beforeend', `<span class="radical-block">${two_radical[i]}</span>`)
    }
}

const words_pad = document.getElementById('words-pad')
const echo_widget = document.getElementById('echo-widget')
const lishu_word = document.getElementById('lishu-word')

words_pad.addEventListener('click', (event) => {
    focus_current()
})

for (let i = 0; i < text.length; ++i) {
    words_pad.insertAdjacentHTML('beforeend',
        `<div class="word-block">
        <label class="ver-middle-line"></label>
        <label class="hor-middle-line"></label>
        <label class="ver-left-line"></label>
        <label class="hor-top-line"></label>
        <label class="ver-right-line"></label>
        <label class="hor-bottom-line"></label>
        <label class="dia-left-line"></label>
        <label class="dia-right-line"></label>
        <label class="nest-line"></label>
        <span class="guide-layer">${text[i]}</span>
        <input class="typing-layer" type="text" tabindex="-1" spellcheck="false">
        <div class="spot-container">
          <svg class="spot-svg" viewBox="-4.5 -4.5 9 9" xmlns="http://www.w3.org/2000/svg">
            <g>
              <circle cx="0" cy="0" r="2" fill="rgba(166,27,41, 0.6)" />
            </g>
          </svg>
        </div>
      </div>`)
}

// ----------------------------------------------------------------------------
// helper function

const sound_effects = new Map()
prepare_sound_effects()

function prepare_sound_effects() {
    const ses = document.getElementById('sound-effects')
    sound_effects['click'] = ses
        // ...
}

function get_child_by_class(nodes, classname) {
    for (let i = 0; i < nodes.length; ++i) {
        if (nodes[i].className === classname) {
            return nodes[i]
        }
    }
}

// ----------------------------------------------------------------------------
// `word block` list structure

const wbs = document.getElementsByClassName('word-block')
let word_blocks = Array.prototype.slice.call(wbs)
let current = 0

function next() {
    if ((++current) <= (word_blocks.length) - 1) {
        return word_blocks[current]
    }
    console.log('word_blocks index out of range.')
    return null
}

function focus_current() {
    get_child_by_class(word_blocks[current].childNodes, 'typing-layer').focus()
}

function focus_next() {
    let guide_node = get_child_by_class(word_blocks[current].childNodes, "guide-layer")
    guide_node.style.color = "transparent"

    let typing_node = get_child_by_class(word_blocks[current].childNodes, "typing-layer")
    typing_node.style.color = '#000000'
    typing_node.value = guide_node.innerText
    typing_node.readonly = "readonly"

    next()
    focus_current()
}

function match_words(words) {
    for (let i = 0; i < words.length; ++i) {
        if (words[i] === get_current_guide_word()) {
            console.log('guide === typing')
            sound_effects['click'].play()
            focus_next()
        } else {
            console.log('guide !== typing')
            reset_current_typing_word()
            mark_spot()
            break
        }
    }
}

function get_current_guide_word() {
    return get_child_by_class(word_blocks[current].childNodes, 'guide-layer').innerText
}

function reset_current_typing_word() {
    get_child_by_class(word_blocks[current].childNodes, 'typing-layer').value = ''
}

function mark_spot() {
    const spot_node = get_child_by_class(word_blocks[current].childNodes, 'spot-container')
    const spot_svg = spot_node.getElementsByTagName('svg')[0]
        // console.log(spot_svg.viewBox.baseVal.width - 1)
    const pos_decrease = Math.min(spot_svg.viewBox.baseVal.x + 0.5, -2)
    const size_increase = Math.max(spot_svg.viewBox.baseVal.width - 1, 4)
    spot_svg.setAttribute("viewBox", `${pos_decrease} ${pos_decrease} ${size_increase} ${size_increase}`);

    spot_node.style.visibility = 'visible'
}

// ----------------------------------------------------------------------------
// `word block` event handler

function handle_input(event) {
    echo_widget.innerText = event.target.value
}

function handle_compositionstart(event) {
    console.log(event.target.value)
}

function handle_compositionupdate(event) {

}

function handle_compositionend(event) {
    match_words(event.target.value)
    echo_widget.innerText = ""
    lishu_word.innerText = get_current_guide_word()
}

for (let i = 0; i < word_blocks.length; ++i) {
    const typing_node = get_child_by_class(word_blocks[i].childNodes, 'typing-layer')

    typing_node.addEventListener('input', handle_input)
    typing_node.addEventListener('compositionstart', handle_compositionstart)
    typing_node.addEventListener('compositionupdate', handle_compositionupdate)
    typing_node.addEventListener('compositionend', handle_compositionend)
    typing_node.onpaste = () => { return false; }
    typing_node.ondrop = () => { return false; }
    typing_node.autocomplete = 'off'

    focus_current()
    lishu_word.innerText = get_current_guide_word()
}