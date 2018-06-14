const js = require('!raw-loader!../main/dist/bundle.js')

module.exports = function (context, req) {
    debugger
    context.res.setHeader('content-type', 'application/javascript; charset=utf-8')
    context.res.isRaw = true
    context.res.body = js
    context.done()
}
