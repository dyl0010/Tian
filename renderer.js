// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

let text = '愿中国青年都摆脱冷气，只是向上走，不必听自暴自弃者流的话。能做事的做事，能发声的发声。有一分热，发一分光。就令萤火一般，也可以在黑暗里发一点光，不必等候炬火。此后如竟没有炬火，我便是唯一的光。'
let test_text = '〇口田回国'
let one_radical = '一丨丶丿乙亅口'
let two_radical = '二亠人儿入八冂冖冫几凵刀力勹匕匚匸十卜卩厂厶又'

// ----------------------------------------------------------------------------
// fill word progress

const words_radical = document.getElementById('words-radical')

fill_radical()

function fill_radical() {
  for (let i = 0; i < two_radical.length; ++i) {
    words_radical.insertAdjacentHTML('beforeend', `<span>${two_radical[i]}</span>`)
  }
}

const words_pad = document.getElementById('words-pad')
const echo_widget = document.getElementById('echo-widget')
const lishu_word = document.getElementById('lishu-word')
const songti_word = document.getElementById('songti-word')

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
        <span class="guide-layer">${text[i]}</span>
        <input class="typing-layer" type="text" spellcheck="false">
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
    if (nodes[i].className == classname) {
      return nodes[i]
    }
  }
}

// ----------------------------------------------------------------------------
// `word block` list structure

const wbs = document.getElementsByClassName('word-block')
let word_blocks = Array.prototype.slice.call(wbs)
let current = 0
// const guide_span = 0;
// const typing_input = 1;

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
  typing_node.style.color = "#26243d"
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

// ----------------------------------------------------------------------------
// `word block` event handler

function handle_input(event) {
  echo_widget.innerText = event.target.value
}

function handle_compositionstart(event) {
}

function handle_compositionupdate(event) {
  
}

function handle_compositionend(event) {
  match_words(event.target.value)
  echo_widget.innerText = ""
  lishu_word.innerText = get_current_guide_word()
  songti_word.innerText = get_current_guide_word()
}

for (let i = 0; i < word_blocks.length; ++i) {
  word_blocks[i].addEventListener('input', handle_input)
  word_blocks[i].addEventListener('compositionstart', handle_compositionstart)
  word_blocks[i].addEventListener('compositionupdate', handle_compositionupdate)
  word_blocks[i].addEventListener('compositionend', handle_compositionend)

  focus_current()
  lishu_word.innerText = get_current_guide_word()
  songti_word.innerText = get_current_guide_word()
}