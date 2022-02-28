window.onload = () => {
    var translate = new Translate()
    translate.init()
    var translateEl = document.querySelector('.translate')
    var errorEl = document.querySelector('.err')
    var coryEl = document.querySelector('.copy')

    translateEl.onclick = () => translate.run()
    coryEl.onclick = copy
    errorEl.onclick = () => translate.retry()
}

function copy() {
    let textarea = document.querySelector('#resultVal')

    if (navigator.clipboard) {
        // clipboard api 复制
        navigator.clipboard.writeText(textarea.value);
    } else {
        textarea.select();
        // 执行复制
        document.execCommand('copy', true);
    }
}


class Translate {
    constructor() {
        this.form = 'auto'
        this.to = ''
        this.fromSelectEl = document.querySelector('#from')
        this.toSelectEl = document.querySelector('#to')
        this.inputEl = document.querySelector('#fromVal')
        this.resultEl = document.querySelector('#result')
        this.resultVal = document.querySelector('#resultVal')
        this.languageList = [
            { label: '自动检测', value: 'auto' },
            { label: '中文', value: 'zh' },
            { label: '英语', value: 'en' },
            { label: '粤语', value: 'yue' },
            { label: '韩语', value: 'kor' },
            { label: '泰语', value: 'th' },
            { label: '葡萄牙语', value: 'pt' },
            { label: '希腊语', value: 'auto' },
            { label: '保加利亚语', value: 'auto' },
            { label: '芬兰语', value: 'auto' },
            { label: '斯洛文利亚语', value: 'auto' },
            { label: '繁体中文', value: 'auto' },
            { label: '法语', value: 'auto' },
            { label: '阿拉伯语', value: 'auto' },
            { label: '荷兰语', value: 'auto' },
            { label: '爱沙尼亚语', value: 'auto' },
            { label: '捷克语', value: 'auto' },
            { label: '瑞典语', value: 'auto' },
            { label: '越南语', value: 'auto' },
            { label: '日语', value: 'auto' },
            { label: '西班牙语', value: 'auto' },
            { label: '俄语', value: 'auto' },
            { label: '意大利语', value: 'auto' },
            { label: '波兰语', value: 'auto' },
            { label: '丹麦语', value: 'auto' },
            { label: '罗马尼亚语', value: 'auto' },
            { label: '匈牙利语', value: 'auto' },
        ]
        this.base = null
        this.errList = []
        this.loading = false
        this.retryState = false
        this.newErrList = []
    }
    init() {
        let fromStr = ''
        let toStr = ''
        this.languageList.forEach((item, index) => {
            fromStr += `<option value="${item.value}">${item.label}</option>`
            index > 0 && (toStr += `<option value="${item.value}">${item.label}</option>`)
        })
        this.fromSelectEl.innerHTML = fromStr
        this.toSelectEl.innerHTML = toStr
    }

    async translate(val) {
        let from = this.fromSelectEl.value
        let to = this.toSelectEl.value
        let url = encodeURI(`/translate?q=${val}&from=${from}&to=${to}`)
        let res = await axios.get(url)
        if (res.status === 200) {
            if (!res.data.trans_result) {
                console.log('翻译错误', val)
                if(this.retryState){
                    this.newErrList.push(val)
                }else{
                    this.errList.push(val)
                }
            }
            return res.data.trans_result[0].dst || ''
        } else {
            return ''
        }
    }

    recursion(base) {
        for (let i in base) {
            if (typeof (base[i]) === 'string') {
                this.translate(base[i]).then((res) => base[i] = res)
            }
            if (Object.prototype.toString.call(base[i]) === '[object Array]') {
                for (let j = 0; j < base[i].length; j++) {
                    this.translate(base[i][j]).then((res) => base[i][j] = res)
                }
            }
            if (Object.prototype.toString.call(base[i]) === '[object Object]') {
                this.recursion(base[i])
            }
        }
    }

    async run(){
        if(this.inputEl.value){
            this.toggleLoading()
            this.base = this.stringToJson(this.inputEl.value)
            if(Object.prototype.toString.call(this.base) !== '[object Object]'){
                let res = await this.translate(this.inputEl.value)
                this.resultVal.value = res
                this.toggleLoading()
            }else{
                this.recursion(this.base)
                let errs = document.querySelector('.errs')
                errs.innerText = ''
                setTimeout(()=>{
                    this.toggleLoading()
                    this.resultVal.value = JSON.stringify(this.base)
                    errs.innerText = this.errList.length > 0 ? JSON.stringify(this.errList): ''
                },10000)
            }
        }
    }
    
    retry(){
        if(this.errList.length > 0){
            this.retryState = true
            this.toggleLoading()
            this.recursion(this.errList)
            let errs = document.querySelector('.errs')
            errs.innerText = ''
            setTimeout(()=>{
                this.toggleLoading()
                this.resultVal.value = JSON.stringify(this.errList)
                this.errList = this.newErrList
                this.newErrList = []
                errs.innerText = this.errList.length > 0 ? JSON.stringify(this.errList): ''
                this.retryState = false
            },10000)
        }
    }

    stringToJson(str){
        if(str.includes(',') || str.includes("'") || str.includes("{") || str.includes("[")){
            return new Function("return " + str)()
        }else{
            str.toString()
        }
    }

    toggleLoading(){
        let loadingEl = document.querySelector('.loading')
        loadingEl.style.display = this.loading ? 'none': 'block'
        this.loading = !this.loading
    }
}