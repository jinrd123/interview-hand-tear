const { randomNum }  = require('./utils');


const reg_mark = /^(.+?)\s/; //匹配以空字符串("\s")结尾的字符串
const reg_sharp = /^\#/; //匹配以#开头的字符串
const reg_crossbar = /^\*/; //匹配以*开头的字符串（无序列表）
const reg_number = /^\d/; //匹配以数字开头的字符串


function createTree(mdArr) {
    let _htmlPool = {};
    let _lastMark = '';
    let _key = 0;

    mdArr.forEach((mdFragment) => {
        const matched = mdFragment.match(reg_mark);
        //console.log(matched);
        /*
            match方法返回数组，第一项为匹配到的原字符串，后面的第二项为正则表达式的()中匹配到的内容，数组的input项为调用match方法的字符串
            [ '# ', '#', index: 0, input: '# 这是一个h1的标题\r', groups: undefined ]
            null
            [ '* ', '*', index: 0, input: '* 这是UL列表第一项\r', groups: undefined ]
            [ '* ', '*', index: 0, input: '* 这是UL列表第一项\r', groups: undefined ]
            [ '* ', '*', index: 0, input: '* 这是UL列表第一项\r', groups: undefined ]
            [ '* ', '*', index: 0, input: '* 这是UL列表第一项\r', groups: undefined ]
            null
            [ '## ', '##', index: 0, input: '## 这是一个h2的列表\r', groups: undefined ]
            null
            [ '1. ', '1.', index: 0, input: '1. 这是一个OL列表\r', groups: undefined ]
            [ '2. ', '2.', index: 0, input: '2. 这是一个OL列表\r', groups: undefined ]
            [ '3. ', '3.', index: 0, input: '3. 这是一个OL列表\r', groups: undefined ]
            [ '4. ', '4.', index: 0, input: '4. 这是一个OL列表', groups: undefined ]
        */
        if(matched) { //去掉空行的情况
            const mark = matched[1]; // 去掉空格的#字符串
            const input = matched["input"];

            if(reg_sharp.test(mark)) { // 对应匹配#开头的数组项

                //console.log(matched);
                /*
                    [ '# ', '#', index: 0, input: '# 这是一个h1的标题\r', groups: undefined ]
                    [ '## ', '##', index: 0, input: '## 这是一个h2的列表\r', groups: undefined ]
                */
               const tag = `h${mark.length}`
               const tagContent = input.replace(reg_mark, '');
               //console.log(tag, tagContent); // h1 这是一个h1的标题
               if(_lastMark === mark) {
                   _htmlPool[`${tag}-${_key}`].tags = [..._htmlPool[`${tag}-${_key}`].tags, `<${tag}>${tagContent}</${tag}>`];
               } else {
                   _lastMark = mark;
                   _key = randomNum();
                   _htmlPool[`${tag}-${_key}`] = {
                       type: 'single',
                       tags: [`<${tag}>${tagContent}</${tag}>`]
                   }
               }
            }

            if(reg_crossbar.test(mark)) {
                const tagContent = input.replace(reg_mark, "");
                const tag = `li`;
                if(reg_crossbar.test(_lastMark)) {
                    _htmlPool[`ul-${_key}`].tags = [..._htmlPool[`ul-${_key}`].tags, `<${tag}>${tagContent}</${tag}>`];
                } else {
                    _lastMark = mark;
                    _key = randomNum();
                    _htmlPool[`ul-${_key}`] = {
                        type: 'wrap',
                        tags: [`<${tag}>${tagContent}</${tag}>`]
                    }
                }
            }

            if(reg_number.test(mark)) {
                const tag = `li`;
                const tagContent = input.replace(reg_mark, '');
                if(reg_number.test(_lastMark)) {
                    _htmlPool[`ol-${_key}`].tags = [..._htmlPool[`ol-${_key}`].tags, `<${tag}>${tagContent}</${tag}>`];
                }else {
                    _lastMark = mark;
                    _key = randomNum();

                    _htmlPool[`ol-${_key}`] = {
                        type: 'wrap',
                        tags: [`<${tag}>${tagContent}</${tag}>`]
                    }
                }
            }
        }

    })
    return _htmlPool;

    // console.log(_htmlPool);
    /*
        {
            h1: { type: 'single', tags: [ '<h1>这是一个h1的标题\r</h1>' ] },
            h2: { type: 'single', tags: [ '<h2>这是一个h2的列表\r</h2>' ] }
        }
    */
}

function compileHTML(_mdArr) {
    const htmlPool = createTree(_mdArr); //[ '# ', '#', index: 0, input: '# 这是一个h1的标题\r', groups: undefined ]
    console.log(htmlPool); // 生成的html结构树（结构对象）
    let htmlStr = '';
    let item;
    for(let k in htmlPool) {
        item = htmlPool[k];

        if(item.type === 'single') {
            item.tags.forEach((tag) => {
                htmlStr += tag.replace("\r", "");
            })
        }else if(item.type === 'wrap') {
            let _list = `<${k.split('-')[0]}>`;
            item.tags.forEach((tag) => {
                _list += tag.replace("\r", "");
            });
            _list += `</${k.split('-')[0]}>`
            htmlStr += _list;
        }
    }
    return htmlStr;
}

module.exports = {
    compileHTML
}