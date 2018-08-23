module.exports = function (context: any, req: any) {
    let js = require('!raw-loader!../dist/bundle.js')
    context.res.setHeader('content-type', 'application/javascript; charset=utf-8')
    context.res.isRaw = true
    context.res.body = js
    context.done()
}
