const { tplReplace } = require('../utils');
function tplLoader(source) {
    source = source.replace(/\s+/g, ""); //替换掉文件中所有的空格和换行
    console.log(source);
    return `
        export default (options) => {
            ${ tplReplace.toString() };
            return tplReplace('${source}', options);
        }
    `;
}

module.exports = tplLoader;
