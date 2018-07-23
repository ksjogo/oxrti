const text = require('!raw-loader!./index.html')
module.exports = function (context: any, req: any) {
    context.res.setHeader('content-type', 'text/html; charset=utf-8')
    context.res.isRaw = true
    context.res.body = text
    context.done()
}
