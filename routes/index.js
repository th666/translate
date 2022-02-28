const router = require('koa-router')()
const axios = require('axios')
const md5 = require('md5')

const config = {
  appId: '20220121001062792',
  secret: '5uYcy8__eUNRCyI3H8vD',
}

router.get('/',() => {})

router.get('/translate', async (ctx, next) => {
  const {q,from,to} = ctx.query
  const random = Math.floor(Math.random()*10000)
  let sign = md5(`${config.appId}${q}${random}${config.secret}`)
  let url  = encodeURI(`https://fanyi-api.baidu.com/api/trans/vip/translate?q=${q}&from=${from}&to=${to}&appid=${config.appId}&salt=${random}&sign=${sign}`)
  console.log(url)
  let res = await axios.get(url)
  ctx.body = res.data
})


module.exports = router
