var glsl = require('glslify');
module.exports = function (content) {
    this.cacheable && this.cacheable();
    this.value = content;
    return "module.exports = " + JSON.stringify(glsl.compile(content));
}
module.exports.seperable = true;