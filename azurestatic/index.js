module.exports=function(e){var t={};function r(n){if(t[n])return t[n].exports;var o=t[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}return r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)r.d(n,o,function(t){return e[t]}.bind(null,o));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=1)}([function(e,t){e.exports='<html>\n\n<head>\n    <title>Oxrti - Wed 11 Jul 2018 18:50:47 BST</title>\n</head>\n\n<body>\n    <script src="${scriptFile}"><\/script>\n</body>\n\n</html>'},function(e,t,r){var n=r(0).replace("${scriptFile}",process.env.WEBSITE_INSTANCE_ID?"https://oxrti.azurewebsites.net/api/azurejs":"http://localhost:7071/api/azurejs");e.exports=function(e,t){e.res.setHeader("content-type","text/html; charset=utf-8"),e.res.isRaw=!0,e.res.body=n,e.done()}}]);
//# sourceMappingURL=index.js.map