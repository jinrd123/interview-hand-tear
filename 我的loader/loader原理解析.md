# loader定义：

* 从概念（作用）上说，loader就是对文件进行处理的东西

webpack配置文件中，webpack配置对象中的`module.rules`数组中的每一个对象就对应了一种文件的处理规则，`test`属性用来进行文件匹配，如果进行webpack打包时，对应的文件类型与某个`test`匹配成功，那么将对这个文件使用`use`属性指定的loader进行处理（`module.rules`中存放若干个文件处理规则，每个文件处理规则的`use`数组中存放若干个loader，use数组中这些loader一起实现了对某种文件的处理流水线）

~~~js
module: {
    rules: [
        {
            test: /\.tpl$/,
            use: [
                'babel-loader',
                {
                    loader: path.resolve(__dirname, 'loaders/tpl-loader'),
                    options: {
                        log: true
                    }
                }
            ]
        }
    ]
},
~~~

* 从语法上说loader就是一个函数，这个函数接收一个source参数，source参数可能是上一个loader处理完传递过来的（上一个loader函数的返回值），当然如果这个loader是第一个对文件进行处理的loader的话，那么source就是源文件内容的字符串

# 实现tpl-loader：

tpl-loader预期功能：

如下面的配置，我们的`tpl-loader`对以`.tpl`为后缀的源文件进行处理

`webpack.config.js`相关配置：

~~~js
module: {
    rules: [
        {
            /*
            	匹配以.tpl结尾的文件
            */
            test: /\.tpl$/,
            use: [
                'babel-loader',
                /*
                	先使用我们自定义的tpl-loader进行处理（再使用babel-loader进行处理）
                */
                {
                    /*
                    	loader属性指定一个文件路径，这个文件就是通过module.exports暴露一个函数，也就是loader函数
                    */
                    loader: path.resolve(__dirname, 'loaders/tpl-loader'),
                    options: { //无关紧要的配置项
                        log: true
                    }
                }
            ]
        }
    ]
},
~~~

.tpl类型的文件就是些html标签，然后标签里面使用`{{}}`的形式包裹了一些变量名

`src/info.tpl`：

~~~
<div>
    <h1>{{ name }}</h1>
    <p>{{ hobby }}</p>
</div>
~~~

我们希望`.tpl`文件经过`tpl-loader`和`babel-loader`处理之后成为的文件：可以通过`import`引入，引入之后获得一个函数，这个函数接收一个配置对象，配置对象里就是`.tpl`文件的`{{}}`中值为key的键值对。最终函数返回`.tpl`文件{{}}中变量替换为配置对象中指定值的dom字符串。

第一点：最后`babel-loader`的处理只是转化js语法（语法降级）,所以实际上并没有对上面的设计目标有什么实际性的帮助，所以可以理解为`.tpl`文件经过`tpl-loader`一个loader处理之后就完成了上面的所有逻辑。

首先需要明确`loader`之间的数据交流收到的参数都是字符串。

既然处理后的`.tpl`可以通过`import`进行引入，那么自然`tpl-loader`方法的返回值肯定是`export`一个函数的字符串形式（`return  str` &&`str = "export function"`）

`tpl-loader`：

~~~js
const { tplReplace } = require('../utils');

function tplLoader(source) {
    source = source.replace(/\s+/g, ""); // 首先替换掉.tpl文件中所有的空格和换行
    console.log(source); // 会在服务端（命令行终端）输出，因为我们在终端执行的npx webpack 
    /*
    	我们下面的返回值会被babel-loader接收（babel什么功能?对js语法进行降级，所以传给babel-loader的字符串的内容最起码是js代码）
    	tplReplace(template, options)函数就是用options对象中的属性替换template中的{{}}
    	也就是说，经过tpl-loader的处理之后（在到达babel-loader之前），我们的.tpl文件已经成为下面return的字符串了，我们的.tpl文件的源文件内容已经成为这个字符串的一个组成部分了（${source}），export暴露的这个方法就是我们在js文件中通过import引入的方法
    */
    return `
        export default (options) => {
            ${ tplReplace.toString() };
            return tplReplace('${source}', options);
        }
    `;
}

module.exports = tplLoader;
~~~

`utils/index.js - tplReplace`（实现字符串替换功能的函数）：

~~~js
function tplReplace(template, replaceObject) {
    /*
    	replace方法的第二个参数为函数时，函数的第一个参数node为匹配到的字符串，后续n个参数依次为正则表达式中n个()匹配到的内容
    */
    return template.replace(/\{\{(.*?)\}\}/g, (node, key) => {
        return replaceObject[key];
    })
}

module.exports = {
    tplReplace
}
~~~

