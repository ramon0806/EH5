HTMLElement.prototype.setModel = function(m) {
    this.model = m
}

HTMLElement.prototype.getModel = function() {
    return this.model
}

HTMLElement.prototype.to = function(p) {
    p.appendChild(this)
    return this
}

HTMLElement.prototype.batchAppend = function(vs) {
    let fragment = document.createDocumentFragment()
    for (let v of vs) {
        fragment.appendChild(v)
    }
    this.appendChild(fragment)
    return this
}

String.prototype.simpleHash = function() {
    let hash = 0
    for (let i = 0; i < this.length; i++) {
        const char = this.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
    }
    return hash.toString(16)
}

Array.prototype.indexOf = function(val) {
    for (let i = 0; i < this.length; i++) {
        if (this[i] == val) {
            return i
        }
    }
    return -1
}

Array.prototype.remove = function(val) {
    let index = this.indexOf(val)
    if (index > -1) {
        this.splice(index, 1)
    }
}

async function loadJS(path) {
    let normalizedPath = new URL(path, window.location.href).href
    let scripts = Array.from(document.head.getElementsByTagName('script'))
    if (scripts.some(script => new URL(script.src).href === normalizedPath)) {
        return
    }

    let script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = path

    return new Promise((resolve, reject) => {
        script.onload = resolve
        script.onerror = () => reject(new Error(`Failed to load script: ${path}`))
        document.head.appendChild(script)
    })
}

async function loadJSs(list) {
    try {
        await Promise.all(list.map(path => loadJS(path)))
    } catch (error) {
        console.error('Script loading failed:', error)
    }
}

window.hintColors = []
window.toasts = []

var metaHTML = `
  <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,minimum-scale=1.0,user-scalable=no">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="referrer" content="no-referrer">
`
document.head.insertAdjacentHTML('beforeend', metaHTML)

var css = `
  html {
    box-sizing: border-box;
  }
  
  *, *::before, *::after {
    box-sizing: inherit;
  }

  .eh5-text {
  	font-size: 14px;
  }

  .eh5-button {
  	display: flex; height: 32px; width: fit-content; padding: 0 12px 0 12px; border-radius: 3px; color: #ffffff; cursor: pointer; user-select: none;
  }

  .eh5-line-button {
  	display: flex; border: 1px solid #00000033; height: 32px; width: fit-content; padding: 0 12px 0 12px; border-radius: 3px; cursor: pointer; user-select: none;
  }

	.eh5-input {
 		outline: none; border: 1px solid #00000033; padding: 0 8px 0 8px; border-radius: 3px; height: 32px; box-sizing: border-box; font-size: 14px;
  }

  .eh5-textarea {
  	outline: none; border: 1px solid #00000033; padding: 8px; border-radius: 3px; resize: none; font-size: 14px; font-family: inherit;
  }
  
  input::placeholder {
    color: #999;
  }
  
  textarea::placeholder {
    color: #999;
  }

  .eh5-checkbox {
  	width: 32px; height: 32px; display: flex;justify-content: center;align-items: center; cursor: pointer;
  }

  .eh5-switcher {
  	width: 36px; height: 36px; display: flex; justify-content: center;align-items: center; cursor: pointer;
  }

  .eh5-switcher-track {
  	width: 36px; height: 20px; border: 1px solid #00000045; border-radius: 10px; display: flex;
  }

  .eh5-switcher-thumb {
  	width: 16px; height: 16px; border-radius: 8px; background: #999; align-self: center; margin: 0 0 0 1px;
  }

  .eh5-loading {
  	width: 32px; height: 32px;  border-top: 1px solid #2277ee; border-left: 1px solid #2277ee; border-right: 1px solid #2277ee; border-radius: 50%; display: none;
  }

  .eh5-tab {
  	height: 32px; border: 1px solid #00000033; border-radius: 4px; width: fit-content;
  }

  .eh5-tab-item {
  	padding: 0 12px 0 12px; height: 32px; line-height: 32px; cursor: pointer; user-select: none;
  }

  .eh5-app-tab {
  	height: 32px;
  }

  .eh5-app-tab-item {
  	padding: 0 12px 0 12px; height: 32px; line-height: 32px; cursor: pointer; user-select: none; flex: 1;
  }

  .eh5-stepper {
  	height: 32px; border: 1px solid #00000033; border-radius: 3px; width: fit-content;
  }

  .eh5-stepper-btn {
  	width: 32px; height: 32px; align-self: center; background: #f9f9f9;
  }

  .eh5-stepper-edit {
  	border: none; width: 40px; height: 32px; text-align: center;
  }

  .eh5-dropdown {
  	width: 160px; height: 32px; border: 1px solid #00000033; border-radius: 3px;
  }

	.eh5-dropdown-list {
 		position: absolute; background: #fff; box-shadow: 0px 2px 8px #00000033; border: 1px solid #00000033; border-radius: 3px; cursor: pointer; padding: 8px 0 8px 0; pointer-events: all;
  }

	.eh5-dropdown-item {
 		height: 36px; padding: 0 8px 0 8px; border-bottom: 1px solid #0000001a; user-select: none; min-height: 36px;
  }

`
document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`)

var rootLayout = createVLayout().setStyle('width: 100%; height: 100%; position: absolute; top: 0')
var floatLayout = createVLayout().setStyle('width: 100%; height: 100%; position: absolute; top: 0; pointer-events: none')
var popLayout = createVLayout().setStyle('width: 100%; height: 100%; position: absolute; top: 0; pointer-events: none')

if (document.body) {
    initBody()
} else {
    document.addEventListener('DOMContentLoaded', () => {
        initBody()
    })
}

function initBody() {
    document.body.style.margin = '0'
    document.body.style.position = 'relative'
    document.body.style.width = '100vw'
    document.body.style.height = '100vh'

    document.body.appendChild(rootLayout)
    document.body.appendChild(floatLayout)
    document.body.appendChild(popLayout)
}

function createDiv() {
    let div = document.createElement("div")
    div.style.overflow = "hidden"
    applyMethod(div)
    return div
}

function createText() {
    let v = createDiv()
    v.classList.add('eh5-text')

    v.text = function(t) {
        v.innerText = t
        return v
    }

    v.center = function() {
        v.style.textAlign = 'center'
        v.style.alignSelf = 'center'
        return v
    }

    v.centerLeft = function() {
        v.style.alignSelf = 'center'
        return v
    }

    v.centerRight = function() {
        v.style.textAlign = 'right'
        v.style.alignSelf = 'center'
        return v
    }

    v.maxLine = function(n) {
        let s = v.style
        s.textOverflow = '-o-ellipsis-lastline'
        s.overflow = 'hidden'
        s.display = '-webkit-box'
        s.webkitLineClamp = n
        s.webkitBoxOrient = 'vertical'
        s.textOverflow = 'ellipsis'
        return v
    }

    return v
}

function createTextBlock() {
    let v = createDiv().setStyle('display: flex')
    v.text = function(t) {
        if (t === undefined) {
            return
        }
        text.text(t)
        return v
    }

    v.center = function() {
        text.center()
        v.setStyle('justify-content: center;')
        return v
    }

    v.centerLeft = function() {
        text.centerLeft()
        return v
    }

    v.centerRight = function() {
        text.centerRight()
        v.setStyle('justify-content: right;')
        return v
    }

    v.maxLine = function(n) {
        text.maxLine(n)
        return v
    }

    let text = createText().setStyle('font-size: inherit;').to(v)
    return v
}

function createImage() {
    let v = createDiv()

    v.setStyle('user-select: none')

    v.src = function(s) {
        if (s === undefined) {
            return v.$src
        }

        if (s === null) {
            s = ''
        }

        v.$svg = null
        v.$src = s
        v.innerHTML = ''

        v.$img = document.createElement('img')
        v.$img.loading = 'lazy'
        applyMethod(v.$img)

        v.$img.style.width = '100%'
        v.$img.style.height = '100%'

        v.$img.setStyle('verticalAlign: middle; object-fit: cover; ')

        v.$img.src = s
        v.appendChild(v.$img)
        return v
    }

    v.svg = function(s) {
        if (!s) {
            return v.$svg
        }

        v.innerHTML = s
        let svgs = v.getElementsByTagName('svg')
        if (svgs.length == 0) {
            return
        }

        applyMethod(svgs[0])

        svgs[0].setStyle('display: block; margin: auto')

        v.$svg = svgs[0]
        v.$svg.style.width = '100%'
        v.$svg.style.height = '100%'

        if (v.$color) {
            v.color(v.$color)
        }

        return v
    }

    v.color = function(c) {
        if (c === undefined) {
            return v.$color
        }

        v.$color = c
        if (!v.$svg) {
            return
        }

        let stroke = v.$svg.getAttribute('stroke')
        if (stroke !== 'none' && stroke) {
            v.$svg.setAttribute("stroke", c)
        }

        let paths = v.$svg.getElementsByTagName("path")
        for (let p of paths) {
            let stroke = p.getAttribute('stroke')
            if (stroke !== 'none' && stroke) {
                p.setAttribute("stroke", c)
            } else {
                p.setAttribute("fill", c)
            }
        }

        let names = ["line", "circle", "ellipse", "rect", "polyline", "polygon"]
        for (let name of names) {
            let elements = v.$svg.getElementsByTagName(name)
            for (let element of elements) {
                let style = element.getAttribute("style")
                if (style) {
                    let frames = style.split(";")
                    let s = ""
                    for (let f of frames) {
                        if (!f.contains("fill")) {
                            s += f + ";"
                        }
                    }
                    s += "fill:" + c
                    element.setAttribute("style", s)
                }
                element.setAttribute("fill", c)
            }
        }
        return v
    }

    return v
}

function createButton() {
    let v = createTextBlock().setStyle('background: #2277ee;')
    v.classList.add('eh5-button')
    v.center()
    addHoverEffect(v)
    return v
}

function createLineButton() {
    let v = createTextBlock()
    v.classList.add('eh5-line-button')
    v.center()
    addHoverEffect(v)
    return v
}

function createInputText() {
    let v = document.createElement('input')
    v.classList.add('eh5-input')
    v.setAttribute('type', 'text')
    applyMethod(v)
    applyEditMethod(v)
    return v
}

function createInputPassword() {
    let v = createInputText()
    v.setAttribute('type', 'password')
    return v
}

function createTextArea() {
    let v = document.createElement('textarea')
    v.classList.add('eh5-textarea')
    applyMethod(v)
    applyEditMethod(v)
    return v
}

function createCheckbox() {
    let v = createDiv()
    v.classList.add('eh5-checkbox')
    v.onChange = function(b) {
        console.log('onchange', b)
    }

    v.accentColor = function(color) {
        checkbox.style.accentColor = color
    }

    v.onclick = function(e) {
        checkbox.click()
        e.stopPropagation()
    }

    let checkbox = document.createElement('input')
    v.checkbox = checkbox

    checkbox.setAttribute('type', 'checkbox')
    checkbox.style.width = '16px'
    checkbox.style.height = '16px'
    checkbox.style.margin = '0px'
    checkbox.style.cursor = 'pointer'
    v.appendChild(checkbox)

    checkbox.addEventListener('click', function(e) {
        e.stopPropagation()
    })

    checkbox.addEventListener('change', function(e) {
        v.onChange(this.checked)
    })

    return v
}

function createCheckboxLabel() {
    let v = createHLayout()
    v.checkbox = createCheckbox().to(v)
    v.label = createText().setStyle('align-self: center; cursor: pointer; user-select: none; margin: 0 0 0 -2px').to(v)
    v.label.onclick = function(e) {
        v.checkbox.checkbox.click()
        e.stopPropagation()
    }
    return v
}

function createSwitcher() {
    let v = createDiv()
    v.classList.add('eh5-switcher')
    v.$accentColor = '#2277ee'
    v.checked = false

    v.accentColor = function(c) {
        v.$accentColor = c
    }

    v.setCheckSilent = function(b) {
        v.checked = b
        if (b) {
            thumb.setStyle('background:' + v.$accentColor + '; margin: 0 0 0 13px')
        }
    }

    v.onChange = function(b) {
        console.log('onchange', b)
    }

    v.onclick = function(e) {
        let uncheckObj = { background: '#999', margin: '0 0 0 1px' }
        let checkObj = { background: v.$accentColor, margin: '0 0 0 17px' }
        if (v.checked) {
            thumb.animate([checkObj, uncheckObj], {
                duration: 100,
                fill: 'forwards'
            })
        } else {
            thumb.animate([uncheckObj, checkObj], {
                duration: 100,
                fill: 'forwards'
            })
        }

        v.checked = !v.checked
        v.onChange(v.checked)
    }

    let track = createDiv().to(v)
    track.classList.add('eh5-switcher-track')

    let thumb = createDiv().to(track)
    thumb.classList.add('eh5-switcher-thumb')

    return v
}

function createLoadingView() {
    let v = createDiv()
    v.classList.add('eh5-loading')

    v.size = function(s) {
        v.setStyle('width:' + s + 'px; height:' + s + 'px')
        return v
    }

    v.color = function(c) {
        console.log("color", c)
        v.setStyle('border-top: 1px solid ' + c + '; border-left: 1px solid ' + c + '; border-right: 1px solid ' + c)
        return v
    }

    v.start = function() {
        v.style.display = 'block'
        v.animation = v.animate([{transform: 'rotate(0deg)'}, {transform: 'rotate(360deg)'}], {
            duration: 1000,
            iterations: Infinity,
            easing: 'linear'
        })
    }

    v.stop = function() {
        v.style.display = 'none'
        if (v.animation) {
            v.animation.cancel()
        }
    }

    return v
}

function createInputDate() {
    let v = document.createElement('input')
    applyMethod(v)
    applyDateMethod(v, 'date')
    return v
}

function createInputTime() {
    let v = document.createElement('input')
    applyMethod(v)
    applyDateMethod(v, 'time')
    return v
}

function createInputDateTime() {
    let v = document.createElement('input')
    applyMethod(v)
    applyDateMethod(v, 'datetime-local')
    return v
}

function createTab() {
    let v = createHLayout()
    v.classList.add('eh5-tab')
    applyTabMethod(v)

    v.createTabItem = function() {
        let t = createText()
        t.classList.add('eh5-tab-item')
        t.center()
        t.select = function(b) {
            t.selected = b
            if (b) {
                t.setStyle('background: ' + v.$accentColor + '; color: #fff')
            } else {
                t.setStyle('background: none; color: #000')
            }
        }
        return t
    }

    return v
}

function createAppTab() {
    let v = createHLayout()
    v.classList.add('eh5-app-tab')
    applyTabMethod(v)

    v.createTabItem = function() {
        let t = createText()
        t.classList.add('eh5-app-tab-item')
        t.center()
        t.select = function(b) {
            t.selected = b
            if (b) {
                t.setStyle('color: ' + v.$accentColor + '; border-bottom: 2px solid ' + v.$accentColor)
            } else {
                t.setStyle('color: #000; border-bottom: none')
            }
        }
        return t
    }

    return v
}

function createStepper() {
    let v = createHLayout()
    v.classList.add('eh5-stepper')

    v.number = 1
    v.minNumber = -9999
    v.maxNumber = 9999
    v.step = 1

    v.setNumber = function(n) {
        if (n === undefined) {
            return
        }

        n = Math.min(n, v.maxNumber)
        n = Math.max(n, v.minNumber)
        v.setNumberSilent(n)
        v.onChange(n)
    }

    v.setNumberSilent = function(n) {
        if (n === undefined) {
            return
        }

        v.number = n
        edit.textSilent(n)
        updateState(n)
    }

    function updateState(n) {
        if (n <= v.minNumber) {
            sub.setStyle('background: #e3e3e3')
        } else {
            sub.setStyle('background: #f9f9f9')
        }

        if (n >= v.maxNumber) {
            add.setStyle('background: #e3e3e3')
        } else {
            add.setStyle('background: #f9f9f9')
        }
    }

    v.onChange = function(n) {
        console.log('onChange', n)
    }

    let sub = createImage()
    sub.classList.add('eh5-stepper-btn')
    sub.svg('<svg viewBox="0 0 32 32" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1"><path d="M8 16h16"/></svg>')
    sub.color('#999')
    sub.onclick = function(e) {
        if (v.number <= v.minNumber) {
            return
        }

        let step = v.step
        let value = v.number - step
        if (value % step != 0) {
            value += step - value % step
        }
        v.setNumber(value)

        e.stopPropagation()
    }
    addHoverEffect(sub)
    v.appendChild(sub)

    let edit = createInputText()
    edit.classList.add('eh5-stepper-edit')
    edit.text(1)
    edit.onTextChanged = function(t) {
        debounce(function() {
            let n = parseInt(t)
            if (isNaN(n)) {
                v.setNumber(v.number)
                return
            }

            console.warn("n", n)

            n = Math.min(n, v.maxNumber)
            n = Math.max(n, v.minNumber)

            v.number = n
            if (n != edit.value) {
                v.setNumber(n)
            } else {
                updateState(n)
                v.onChange(n)
            }
        }, 1000)
    }
    v.appendChild(edit)

    let add = createImage()
    add.classList.add('eh5-stepper-btn')
    add.svg('<svg viewBox="0 0 32 32" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1"><path d="M16 8v16M8 16h16"/></svg>')
    add.color('#999')
    add.onclick = function(e) {
        if (v.number >= v.maxNumber) {
            return
        }

        let step = v.step
        let value = v.number + step
        if (value % step != 0) {
            value -= value % step
        }
        v.setNumber(value)
    }
    addHoverEffect(add)
    v.appendChild(add)

    return v
}

function createDropdown() {
    let v = createHLayout()
    v.classList.add('eh5-dropdown')
    v.setModel = function(m) {
        v.model = m

        if (m.hint) {
            placeHolder.text(m.hint)
        }

        let datas = m.datas || []
        for (let d of datas) {
            if (d.select) {
                placeHolder.text(d.text)
                placeHolder.setStyle('color: #333')
            }
        }
    }

    v.onSelect = function(t) {
        console.log("onSelect", t)
    }

    let placeHolder = createText()
    placeHolder.setStyle('flex: 1; padding: 0 0 0 8px; color: #999')
    placeHolder.maxLine(1)
    placeHolder.centerLeft()
    v.appendChild(placeHolder)

    let arrow = createImage()
    arrow.svg('<svg viewBox="0 0 32 32" width="32" height="32"><path d="M12 10l6 6-6 6" stroke="currentColor" stroke-width="1" fill="none"/></svg>')
    arrow.setStyle('width: 32px; height: 32px')
    arrow.color('#ccc')
    v.appendChild(arrow)

    v.onclick = function(e) {
        let li = createVLayout()
        li.classList.add('eh5-dropdown-list')

        let datas = v.model.datas || []
        let items = []
        for (let i = 0; i < datas.length; i++) {
            let d = datas[i]
            let text = d.text
            let c = createTextBlock()
            c.classList.add('eh5-dropdown-item')
            c.maxLine(1)
            c.text(text).centerLeft()
            if (i == datas.length - 1) {
                c.setStyle('border-bottom: none')
            }

            c.onclick = function(e) {
                popLayout.innerHTML = ''

                let t = this.innerText
                v.onSelect(t)

                placeHolder.innerText = t
                placeHolder.setStyle('color: #000')

                startRotateAmination(arrow, 90, 0, 100)

                e.stopPropagation()
            }

            items.push(c)

            let h = datas.length * 36 + 16
            if (datas.length > 10) {
                h = 360

                li.style.overflowY = 'auto'
                li.style.webkitOverflowScrolling = 'touch'
                li.style.overscrollBehavior = 'contain'
            }

            li.setStyle('width: 160px; height: ' + h + 'px;')
        }

        li.batchAppend(items)


        let rect = v.getBoundingClientRect()

        showMaskPop(li, {
            x: rect.left,
            y: rect.top + 36
        }, function() {
            startRotateAmination(arrow, 90, 0, 100)
        })

        setTimeout(() => {
            for (let c of li.children) {
                addHoverEffect(c)
            }
        }, 50)

        startRotateAmination(arrow, 0, 90, 100)

        e.stopPropagation()
    }
    return v
}

function createDialog() {
    let v = createVLayout()
    v.setModel = function(m) {
        v.model = m
        v.titleView.text(m.title || '')
        v.messageView.text(m.message || '')
        return v
    }

    v.show = function() {
        showPanel(v)
    }

    v.onCancel = function() {
        console.log("onCancel")
    }

    v.onConfirm = function() {
        console.log("onConfirm")
    }

    v.titleView = createText().text('title').setStyle('font-size: 16px; font-weight: 900').to(v)
    v.messageView = createText().setStyle('margin: 16px 0').to(v)

    let layout = createHLayout().to(v)
    v.cancelBtn = createLineButton().text('Cancel').setStyle('flex: 1').click(function(e) {
        hidePanel()
        v.onCancel()
        e.stopPropagation()
    }).to(layout)

    v.confirmBtn = createButton().text('Confirm').setStyle('flex: 1; margin: 0 0 0 16px').click(function(e) {
        hidePanel()
        v.onConfirm()
        e.stopPropagation()
    }).to(layout)

    v.setStyle('width: 320px; height: fit-content; padding: 24px; background: #fff')

    return v
}

function createHLayout() {
    let v = createDiv()
    v.style.display = 'flex'
    // v.style.flexShrink = 0
    return v
}

function createVLayout() {
    let div = createDiv()
    div.style.display = 'flex'
    div.style.flexShrink = 0
    div.style.flexDirection = 'column'
    div.style.width = '100%'
    return div
}

function createVScrollView() {
    let v = createVLayout()
    v.hideScrollbar = function() {
        v.setStyle('scrollbar-width: none; -ms-overflow-style: none')
    }

    v.setStyle('overflow-y: auto; overscroll-behavior: contain')
    return v
}

function showPanel(v, hideCallback) {
    let mask = createDiv()
    mask.class = 'panel_mask'
    mask.setStyle('background:#00000033; width: 100%; height: 100%; position: absolute; pointer-events: all')
    mask.onclick = function() {
        let duration = 150
        mask.animate([{background: '#00000033'}, {background: '#00000000'}], {
            duration,
            fill: 'forwards'
        })

        container.animate([{ opacity: 1}, { opacity: 0}], {
            duration,
            fill: 'forwards'
        })

        setTimeout(() => {
            mask.remove()
            container.remove()

            if (hideCallback) {
                hideCallback()
            }
        }, duration)
    }
    floatLayout.appendChild(mask)

    mask.animate([{background: '#00000000'}, {background: '#00000033'}], {
        duration: 300,
        fill: 'forwards'
    })

    let container = createVLayout()
    container.class = 'panel_container'
    container.setStyle('background: #fff; width: fit-content; height: fit-content; position: absolute; border-radius: 4px; pointer-events: all; box-shadow: 0px 4px 8px #00000033')
    container.appendChild(v)

    floatLayout.appendChild(container)

    let x = (window.innerWidth - container.clientWidth) / 2
    let y = (window.innerHeight - container.clientHeight) / 2
    container.setStyle('left:' + x + 'px; top:' + y + 'px')

    container.animate([{transform: 'translateY(100px)', opacity: 0}, {transform: 'translateY(0px)', opacity: 1}], {
        duration: 300,
        fill: 'forwards'
    })

    return container
}

function hidePanel() {
    let duration = 150
    let children = floatLayout.children
    for (let i = children.length - 1; i >= 0; i--) {
        let c = children[i]

        if (c.class == 'panel_mask') {
            c.animate([{background: '#00000033'}, {background: '#00000000'}], {
                duration: duration,
                fill: 'forwards'
            })

            setTimeout(() => {
                c.remove()
                if (i == 0) {
                    floatLayout.innerHTML = ''
                }
            }, duration)

            break
        }

        if (c.class == 'panel_container') {
            c.animate([{ opacity: 1}, { opacity: 0}], {
                duration: duration,
                fill: 'forwards'
            })

            setTimeout(() => {
                c.remove()
            }, duration)
        }
    }
}

function showSlideView(v, hideCallback) {
    let mask = createDiv()
    mask.class = 'slide_mask'
    mask.setStyle('background:#00000000; width: 100%; height: 100%; pointer-events: all; position: absolute; ')
    mask.onclick = function() {
        hideSlideView()

        if (hideCallback) {
            hideCallback()
        }
    }
    floatLayout.appendChild(mask)

    let container = createVLayout()
    container.class = 'slide_container'
    let w = window.innerWidth
    if (v.requestWidth) {
        w = Math.min(window.innerWidth, v.requestWidth)
    } else {
        if (window.innerWidth >= 480) {
            w = 400
        }

        if (window.innerWidth >= 640) {
            w = 480
        }
    }

    let x = window.innerWidth - w
    container.setStyle('background: #fff; width: ' + w + 'px; height: 100%; position: absolute; left:' + x + 'px')

    container.animate([{transform: 'translateX(' + w + 'px)'}, {transform: 'translateX(0px)'}], {
        duration: 300,
        fill: 'forwards'
    })

    mask.animate([{background: '#00000000'}, {background: '#00000033'}], {
        duration: 300,
        fill: 'forwards'
    })

    container.appendChild(v)

    floatLayout.appendChild(container)

    return container
}

function hideSlideView() {
    let children = floatLayout.children
    for (let i = children.length - 1; i >= 0; i--) {
        let c = children[i]
        if (c.class == 'slide_mask') {
            c.animate([{background: '#00000033'}, {background: '#00000000'}], {
                duration: 300,
                fill: 'forwards'
            })

            setTimeout(() => {
                c.remove()
                if (i == 0) {
                    floatLayout.innerHTML = ''
                }
            }, 300)

            break
        }

        if (c.class == 'slide_container') {
            c.animate([{transform: 'translateX(0px)'}, {transform: 'translateX(' + c.clientWidth + 'px)'}], {
                duration: 300,
                fill: 'forwards'
            })

            setTimeout(() => {
                c.remove()
            }, 300)
        }
    }
}

function showMaskPop(v, offset, hideCallback) {
    let mask = createDiv()
    mask.setStyle('background:#00000033; width: 100%; height: 100%; pointer-events: all')
    mask.onclick = function() {
        popLayout.innerHTML = ''

        if (hideCallback) {
            hideCallback()
        }
    }

    popLayout.appendChild(mask)

    v.style.position = 'absolute'
    popLayout.appendChild(v)

    if (offset) {
        const {x, y} = calculatePosition(v, offset, popLayout)
        v.setStyle('left: ' + x + 'px; top:' + y + "px")
    }
}

function showPop(v, offset) {
    popLayout.appendChild(v)

    if (offset) {
        const {x, y} = calculatePosition(v, offset, popLayout)
        v.setStyle('left: ' + x + 'px; top:' + y + "px")
    }
}

function showSuccessToast(t) {
    let toast = showToast(t)
    toast.setStyle('background: #eaf7eeff; border: 1px solid #38b25a33')
    toast.children[0].svg('<svg t="1754894932223" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6077" width="16" height="16"><path d="M731.733333 294.4L450.133333 631.466667l-134.4-134.4-53.333333 53.333333 194.133333 194.133333L789.333333 345.6l-57.6-51.2zM512 992C247.466667 992 32 776.533333 32 512S247.466667 32 512 32 992 247.466667 992 512 776.533333 992 512 992z" p-id="6078"></path></svg>')
    toast.children[0].color('#38b25aff')
    toast.children[0].setStyle('width: 18px')
    return toast
}

function showWarnToast(t) {
    let toast = showToast(t)
    toast.setStyle('background: #fef7eaff; border: 1px solid #ef960233')
    toast.children[0].style.transform = 'rotate(180deg)'
    toast.children[0].color('#ef9602ff')
    return toast
}

function showErrorToast(t) {
    let toast = showToast(t)
    toast.setStyle('background: #fcede9ff; border: 1px solid #eb4c2b33')
    toast.children[0].style.transform = 'rotate(180deg)'
    toast.children[0].color('#eb4c2bff')
    return toast
}

function showToast(t) {
    let toast = createHLayout().setStyle('width: fit-content; height: fit-content; background: #e7eefaf0; border: 1px solid #0f6ade33; border-radius: 4px; position: absolute; opacity: 0')
    let icon = createImage().to(toast)
    icon.svg('<svg t="1754891577608" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3424" width="16" height="16"><path d="M512 85.333333C277.333333 85.333333 85.333333 277.333333 85.333333 512s192 426.666667 426.666667 426.666667c234.666667 0 426.666667-192 426.666667-426.666667S746.666667 85.333333 512 85.333333zM554.666667 725.333333l-85.333333 0 0-256 85.333333 0L554.666667 725.333333zM554.666667 384l-85.333333 0L469.333333 298.666667l85.333333 0L554.666667 384z" p-id="3425"></path></svg>')
    icon.setStyle('width: 20px; height: 20px; align-self: center; margin: 0 8px 0 8px')
    icon.color('#0f6adeff')

    let text = createText().to(toast)
    text.text(t)
    text.setStyle('align-self: center; margin: 0 12px 0 0; padding: 6px 0; max-width: 216px')

    if (window.innerWidth > 480) {
        toast.setStyle('width: 264px')
        text.setStyle('padding: 8px 0;')
    }

    showPop(toast)

    if (!window.toasts) {
        window.toasts = []
    }

    if (window.innerWidth <= 480) {
        for (let t of toasts) {
            let top = parseInt(t.style.top)
            t.animate([{top: t.style.top}, {top: (top - toast.clientHeight - 8) + "px"}], {
                duration: 100,
                fill: 'forwards'
            })
            t.style.top = (top - toast.clientHeight - 8) + "px"
        }

        let x = (window.innerWidth - toast.clientWidth) / 2
        let y = (window.innerHeight - toast.clientHeight) / 2
        toast.setStyle('left:' + x + 'px; top:' + y + 'px')
    } else {
        for (let t of toasts) {
            let top = parseInt(t.style.top)
            t.animate([{top: t.style.top}, {top: (top + toast.clientHeight + 8) + "px"}], {
                duration: 100,
                fill: 'forwards'
            })
            t.style.top = (top + toast.clientHeight + 8) + "px"
        }

        let x = window.innerWidth - toast.clientWidth + 4
        let y = 32
        toast.setStyle('left:' + x + 'px; top:' + y + 'px')
    }

    toasts.push(toast)

    if (toasts.length == 0) {
        startAlphaAnimation(toast, 0, 1, 200)
    } else {
        setTimeout(() => {
            startAlphaAnimation(toast, 0, 1, 200)
        }, 100)
    }

    toast.timeoutId = setTimeout(() => {
        startAlphaAnimation(toast, 1, 0, 1000)
        setTimeout(() => {
            toast.remove()
            window.toasts.remove(toast)
        }, 1000)
    }, 5000)

    return toast
}

function calculatePosition(v, offset, popLayout) {
    let x = offset.x
    if (x + v.clientWidth > popLayout.clientWidth) {
        x = popLayout.clientWidth - v.clientWidth - 8
    }
    x = Math.max(x, 8)

    let vph = popLayout.clientHeight
    let y = offset.y
    if (y + v.clientHeight > vph) {
        y = vph - v.clientHeight - 8
    }
    y = Math.max(y, 8)

    return {x, y}
}


function applyMethod(node) {
    node.css = function(k, v) {
        node.style[k] = v
        return node
    }

    node.getStyle = function(attrName) {
        return node.style[attrName]
    }

    node.setStyle = function(str) {
        if (!str) {
            return node
        }

        let style = node.getAttribute("style") || ""
        let frames = style.split(";")
        let styleObj = {}
        for (let f of frames) {
            if (f.trim() == "") {
                continue
            }
            let [k, v] = f.split(":")
            styleObj[k.trim()] = v.trim()
        }

        let newFrames = str.split(";")
        for (let f of newFrames) {
            if (f.trim() == "") {
                continue
            }
            let [k, v] = f.split(":")
            styleObj[k.trim()] = v.trim()
        }

        let newStr = ""
        for (let key in styleObj) {
            newStr += key + ":" + styleObj[key] + ";"
        }

        node.setAttribute("style", newStr)
        return node
    }

    node.click = function(f) {
        node.style.cursor = 'pointer'
        node.onclick = f
        return node
    }
}


function applyEditMethod(node) {
    node.isComposing = false

    node.text = function(t) {
        node.value = t
        node.onTextChanged(t)
        return node
    }

    node.textSilent = function(t) {
        node.value = t
        return node
    }

    node.hint = function(h) {
        node.setAttribute('placeholder', h)
        return node
    }

    node.hintColor = function(c) {
        let v = parseColor(c)
        let f = v.r + "_" + v.g + "_" + v.r
        let key = "hintColor_" + f
        if (!window.hintColors.indexOf(f) >= 0) {
            let css = document.createElement("style")
            css.innerHTML = "." + key + "::-webkit-input-placeholder{ color:" + c + "}"
            document.head.appendChild(css)
            window.hintColors.push(f)
        }
        node.className += key + " "
        return node
    }

    node.onTextChanged = function(t) {}

    node.oninput = function(e) {
        if (node.isComposing) {
            return
        }
        node.onTextChanged(node.value)
    }
    node.addEventListener("compositionstart", function() {
        node.isComposing = true
    })
    node.addEventListener("compositionend", function() {
        node.isComposing = false
        node.onTextChanged(node.value)
    })
}

function applyTabMethod(v) {
    v.$accentColor = '#2277ee'
    v.curIndex = 0

    v.accentColor = function(c) {
        v.$accentColor = c
    }

    v.onSelectIndex = function(index) {
        console.log("onSelectIndex", index)
    }

    v.onSelect = function(v) {
        console.log("onSelect", v)
    }

    v.selectIndexSilent = function(index) {
        curIndex = index
        for (let i = 0; i < v.children.length; i++) {
            let c = v.children[i]
            c.select(i == index)
        }
    }

    v.selectSilent = function(t) {
        let datas = v.model.datas || []
        let index = datas.findIndex(child => child.text == t)
        v.selectIndexSilent(index)
    }

    v.setModel = function(m) {
        v.model = m

        let datas = m.datas || []
        for (let d of datas) {
            let text = d.text
            let item = v.createTabItem()
            item.text(text)
            if (d.select) {
                item.select(true)
            }

            item.onclick = function(e) {
                for (let c of v.children) {
                    c.select(c == this)
                }

                curIndex = [...v.children].indexOf(this)

                v.onSelectIndex(curIndex)
                v.onSelect(this.innerText)

                e.stopPropagation()
            }

            v.appendChild(item)
        }
    }
}

function applyDateMethod(v, type) {
    v.setAttribute('type', type)

    v.getTimestamp = function() {
        return inputValueToTimestamp(v.value, type)
    }

    v.setTimestamp = function(timestamp) {
        v.value = timestampToInputValue(timestamp, type)
    }

    v.onChange = function(timestamp) {
        console.log("onChange", timestamp)
    }

    v.setStyle('width: fit-content; height: 32px; border: 1px solid #00000033; border-radius: 3px; padding: 0 8px')

    if (type == 'time' || type == 'datetime-local') {
        v.addEventListener('focus', function() {
            setTimeout(() => {
                let mask = createDiv()
                mask.setStyle('background:#00000000; width: 100%; height: 100%; pointer-events: all')
                mask.onclick = function() {
                    popLayout.innerHTML = ''
                }
                popLayout.appendChild(mask)
            }, 100)
        })
    }

    v.addEventListener('change', () => {
        let timestamp = v.getTimestamp()
        v.onChange(timestamp)
    })
}

function dateStringToTimestamp(dateStr) {
    return dateStr ? new Date(dateStr).getTime() : null
}

function timeStringToTimestamp(timeStr) {
    if (!timeStr) return null
    const [hours, minutes] = timeStr.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    return date.getTime()
}

function datetimeStringToTimestamp(datetimeStr) {
    return datetimeStr ? new Date(datetimeStr).getTime() : null
}

function inputValueToTimestamp(str, type) {
    if (!str) return null
    switch (type) {
        case 'date':
            return dateStringToTimestamp(str)
        case 'time':
            return timeStringToTimestamp(str)
        case 'datetime-local':
            return datetimeStringToTimestamp(str)
        default:
            return null
    }
}

function timestampToInputValue(timestamp, type) {
    if (!timestamp) return ''
    const date = new Date(timestamp)

    switch (type) {
        case 'date':
            return date.toISOString().split('T')[0]
        case 'time':
            return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
        case 'datetime-local':
            return new Date(timestamp - date.getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 16)
        default:
            return ''
    }
}

function addHoverEffect(v) {
    v.onmouseenter = function() {
        v.$background = v.style.background
        let b = '#00000008'
        if (v.$background) {
            b = mixColor('#000', v.$background, 0.05)
        }

        v.setStyle('background: ' + b)
    }

    v.onmouseleave = function() {
        v.setStyle('background: ' + v.$background)
    }
}

function addColorHoverEffect(v) {
    v.onmouseenter = function() {
        if (v.$svg) {
            v.$$color = v.$color
            let c = mixColor('#000', v.$color, 0.2)
            console.log(c)
            v.color(c)
            return
        }

        v.$color = v.style.color
        let c = '#00000008'
        if (v.$color) {
            c = mixColor('#000', v.$color, 0.2)
        }

        v.setStyle('color: ' + c)
    }

    v.onmouseleave = function() {
        if (v.$svg) {
            v.color(v.$$color)
            return
        }

        v.setStyle('color: ' + v.$color)
    }
}

function mixColor(forecolor, bgcolor, alpha) {
    let f = parseColor(forecolor)
    let bg = parseColor(bgcolor)

    let r = Math.round(f.r * alpha + bg.r * (1 - alpha))
    let g = Math.round(f.g * alpha + bg.g * (1 - alpha))
    let b = Math.round(f.b * alpha + bg.b * (1 - alpha))
    return '#' + r.toString(16) + g.toString(16) + b.toString(16)
}

function parseColor(color) {
    if (typeof color != 'string') {
        return {r: 0, g: 0, b: 0, a: 0}
    }

    if (color == 'none') {
        return {r: 0, g: 0, b: 0, a: 0}
    }

    if (color.indexOf("rgb") == 0) {
        let frames = color.split(",")
        let r = parseInt(frames[0].split("(")[1])
        let g = parseInt(frames[1])
        let b = parseInt(frames[2])
        let a = 1
        if (frames.length == 4) {
            a = parseFloat(frames[3].split(")")[0])
        }
        return {r, g, b, a}
    } else if (color.indexOf("rgb") == 0) {
        let frames = color.split(",")
        let r = parseInt(frames[0].split("(")[1])
        let g = parseInt(frames[1])
        let b = parseInt(frames[2])
        let a = 1
        if (frames.length == 4) {
            a = parseFloat(frames[3].split(")")[0])
        }
        return {r, g, b, a}
    } else if (color.indexOf('#') == 0) {
        if (color.length == 4) {
            color = '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3]
        }

        let r = parseInt(color.substr(1, 2), 16)
        let g = parseInt(color.substr(3, 2), 16)
        let b = parseInt(color.substr(5, 2), 16)

        let a = 1
        if (color.length == 9) {
            a = parseInt(color.substr(7, 2), 16) / 255
        }

        return {r, g, b, a}
    }

    return {r: 0, g: 0, b: 0, a: 0}
}

function debounce(fn, delay) {
    let fnId = fn.toString().simpleHash()
    if (!window.debounceMap) {
        window.debounceMap = {}
    }
    let timerId = window.debounceMap[fnId]
    if (timerId === undefined) {
        timerId = -1
        window.debounceMap[fnId] = timerId
    }

    clearTimeout(timerId)
    timerId = setTimeout(() => {
        fn()
    }, delay)

    window.debounceMap[fnId] = timerId
}

function startRotateAmination(v, fromDegree, toDegree, duration) {
    v.animate([{transform: 'rotate(' + fromDegree + 'deg)'}, {transform: 'rotate(' + toDegree + 'deg)'}], {
        duration: duration,
        fill: 'forwards'
    })
}

function startAlphaAnimation(v, fromAlpha, toAlpha, duration) {
    v.animate([{opacity: fromAlpha}, {opacity: toAlpha}], {
        duration: duration,
        fill: 'forwards'
    })
}