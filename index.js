const fetch = require(`isomorphic-fetch`);
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const url = 'https://www.amazon.com/AmazonBasics-DisplayPort-Display-Adapter-Cable/dp/B0134V29UA/ref=pb_d_jfyfob_3?pd_rd_w=AlXPJ&pf_rd_p=6796bd25-a33e-41f8-bc5e-d4f57bc3acd8&pf_rd_r=0G4SG02HACS2NWT3NJ0D&pd_rd_r=f422442d-476f-40c5-8f9f-05c33d96ebed&pd_rd_wg=vduTt&pd_rd_i=B01EN1PI8K&psc=1';

(async () => {
    try{
        const response = await fetch(url)
        .then(res => {
            return res;
        })
        .catch(err => {
            throw new Error(err);
        })
        const text = await response.text();
        const dom = await new JSDOM(text);
        let h1Array = regexMatch(removeSingleElements(dom.window.document.querySelector("h1").textContent.replace(/\s+/g, " ").trim().split(" ")));
        let ulArray = regexMatch(removeSingleElements(dom.window.document.querySelector("ul").textContent.replace(/\s+/g, " ").trim().split(" ")));
        let freq_words = {};
        for(h1word in h1Array) {
            freq_words[h1Array[h1word]] = 0;
            for(ulword in ulArray) {
                if(ulArray[ulword].toLowerCase().includes(h1Array[h1word].toLowerCase())) {
                    freq_words[h1Array[h1word]] += 1;
                }
            }
        }
        console.log(`freq_words: `,filterObject(freq_words));
        let contentArray = regexMatch(removeSingleElements(dom.window.document.querySelector("body").textContent.replace(/\s+/g, " ").trim().split(" ")));

        let dom_freq = {};
        for(word in h1Array) {
            dom_freq[h1Array[word]] = 0;
            for(domWord in contentArray) {
                if(contentArray[domWord].toLowerCase().includes(h1Array[word].toLowerCase())) {
                    dom_freq[h1Array[word]] += 1;
                }
            }
        }
        console.log(filterObject(dom_freq))
    }
    catch(err) {
        console.log(`Some error occured: `,err)
    }
  })()

function removeSingleElements (array) {
    let result = array.filter(item => {
        if(item.length > 1) {
            return item.toLowerCase();
        }
    });
    return result;
}

function regexMatch(array) {
    let articles = [`a`, `an`, `with`, `the`, `is`, `for`, `and`, `in`, `if`, `be`, `to`, `too`, `var`, `try`, `function`, `try`, `catch`, `amazon`, `basics`];
    let result = array.filter(item => {
        if(!item.match(/[!@=[;\]#$%^&*(),.?":{}|<>]/) 
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