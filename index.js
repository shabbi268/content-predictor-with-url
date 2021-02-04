const fetch = require(`isomorphic-fetch`);
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const url = `https://www.geisinger.org/health-and-wellness/wellness-articles/2017/10/02/17/07/how-to-have-the-talk-with-your-kids`;

(async function getTopics() {
    let result = [];
    try{
        const response = await fetch(url)
            .then(res => {
                return res;
            })
            .catch(err => {
                throw new Error(err);
            });
        const text = await response.text();
        const dom = await new JSDOM(text);
        let h1Array = regexMatch(removeSingleElements(dom.window.document.querySelector("h1").textContent.replace(/\s+/g, " ").trim().split(" ")));
        let contentArray = regexMatch(removeSingleElements(dom.window.document.querySelector("body").textContent.replace(/\s+/g, " ").trim().split(" ")));

        //Amazon articles
        if( contentArray.length > 3000 ) {
            console.log(`in IF loop`, h1Array);
            let dom_freq = {};
            for(word in h1Array) {
                dom_freq[h1Array[word]] = 0;
                for(domWord in contentArray) {
                    if(contentArray[domWord].toLowerCase().includes(h1Array[word].toLowerCase())) {
                        dom_freq[h1Array[word]] += 1;
                    }
                }
            }
            for (let word in filterObject(dom_freq)) {
                result.push(word);
            }
            result.sort(function(a, b) {
                return b[1] - a[1];
            });
            console.log(`Topics: `,result.slice(0,16));
            return result.slice(0,16);
        }
        //All other articles
        else {
            let testDom = {};
            for(word1 in contentArray) {
                testDom[contentArray[word1].toLowerCase()] = 0;
                for(word2 in contentArray) {
                    if(contentArray[word2].toLowerCase().includes(contentArray[word1].toLowerCase()) 
                        || contentArray[word1].toLowerCase().includes(contentArray[word2].toLowerCase()) ) {
                            testDom[contentArray[word1].toLowerCase()] += 1;
                    }
                }
            }
            for (let word in filterContentDOMObject(testDom)) {
                result.push(word);
            }
            result.sort(function(a, b) {
                return b[1] - a[1];
            });
            console.log(`Topics: `,result.slice(0,16));
            return result.slice(0,16);

        }
    }
    catch(err) {
        console.log(`Some error occurred: `,err)
    }
})();

function removeSingleElements (array) {
    let result = array.filter(item => {
        if(item.length > 1) {
            return item.toLowerCase();
        }
    });
    return result;
}

function regexMatch(array) {
    let articles = [`a`, `an`, `with`, `had`, `have`, `from`, `this`, `that`, `const`, `did`, `it`, `in`, `wont`, `would`, `the`, `is`, `for`, `and`, `more`, `in`, `if`, `be`, `to`, `too`, `var`, `try`, `you`, `your`, `function`, `try`, `catch`, `amazon`, `basics`];
    let result = array.filter(item => {
        if(!item.match(/[!@=[;\]#$%^&*()_^,'’”.\-?":{}|<>]/) 
            & !articles.includes(item.trim().toLowerCase())
            & !item.match(/.*to/)) {
            return item;
        }
    })
    // console.log(`result: `,result)
    return result;
}

function filterObject(object) {
    let result = {};
    for (const [key, value] of Object.entries(object)) {
        if(value > 1) {
            result[key] = value;
        }
    }
    return result;
}

function filterContentDOMObject(object) {
    let result = {};
    for (const [key, value] of Object.entries(object)) {
        if(value > 10 && key.length > 3) {
            result[key] = value;
        }
    }
    return result;
}
