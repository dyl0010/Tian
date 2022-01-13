console.log('splash loading...');

function handle_animation_start() {
    console.log('handle_animation_start')
}

// all_radicals = `一丨丶丿乙亅口
// 二亠人儿入八冂冖冫几凵刀力勹匕匚匸十卜卩厂厶又
// 囗土士夂夊夕大女子宀寸小尢尸屮山巛工己巾干幺广廴廾弋弓彐彡彳手
// 心戈戶支攴文斗斤方无日曰月木欠止歹殳毋比毛氏气水火爪父爻爿片牙牛犬玉
// 玄瓜瓦甘生用田疋疒癶白皮皿目矛矢石示禸禾穴立
// 竹米糸缶网羊羽老而耒耳聿肉臣自至臼舌舛舟艮色艸虍虫血行衣襾
// 見角言谷豆豕豸貝赤走足身車辛辰辵邑酉釆里
// 金長門阜隶隹雨青非
// 面革韋韭音頁風飛食首香
// 馬骨高髟鬥鬯鬲鬼
// 魚鳥鹵鹿麥麻
// 黃黍黑黹
// 黽鼎鼓鼠
// 鼻齊
// 齒
// 龍龜
// 龠`

// all_radicals = `一丨丶丿乙亅口二亠人儿入八冂冖冫几凵刀力勹匕匚匸十卜卩厂厶又囗土士夂夊夕大女子宀寸小尢尸屮山巛工己巾干幺广廴廾弋弓彐彡彳手心戈戶支攴文斗斤方无日曰月木欠止歹殳毋比毛氏气水火爪父爻爿片牙牛犬玉玄瓜瓦甘生用田疋疒癶白皮皿目矛矢石示禸禾穴立竹米糸缶网羊羽老而耒耳聿肉臣自至臼舌舛舟艮色艸虍虫血行衣襾見角言谷豆豕豸貝赤走足身車辛辰辵邑酉釆里金長門阜隶隹雨青非面革韋韭音頁風飛食首香馬骨高髟鬥鬯鬲鬼魚鳥鹵鹿麥麻黃黍黑黹黽鼎鼓鼠鼻齊齒龍龜龠`

some_beauties = `一十士土王丰甘`

guide_layer = document.getElementById('guide-layer')

count = 1

function update_words(text) {
    if (count >= text.length) {
        count = 0
    }

    if (guide_layer) {
        guide_layer.innerText = text[count++]
    }
}

function handle_animation_iteration(text) {
    // console.log('handle_animation_iteration')

    update_words(some_beauties)
}

function handle_animation_end() {
    console.log('handle_animation_end')
}

function register_animation_handlers() {
    let loading_anim = document.getElementById('loading-anim')
    loading_anim.addEventListener('animationstart', handle_animation_start)
    loading_anim.addEventListener('animationiteration', handle_animation_iteration)
    loading_anim.addEventListener('animationend', handle_animation_end)
}

//
// entry point
register_animation_handlers()