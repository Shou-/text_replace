// ==UserScript==
// @name            text_replace
// @namespace       https://github.com/Shou-/text_replace
// @description     Replace text on submit on Bungie.net
// @version         0.539
// @include         http*://*bungie.net/*createpost.aspx*
// @include         http*://*bungie.net*/Forums/posts.aspx*
// @include         http*://*bungie.net/Account/Profile.aspx?msgID=*
// @author          Shou
// @copyright       2012, Shou
// @license	        (CC) Attribution Non-Commercial Share Alike; http://creativecommons.org/licenses/by-nc-sa/3.0/
// @updateURL       https://github.com/Shou-/text_replace/raw/master/text_replace.user.js
// ==/UserScript==


// Please note that bypassing the swear word filter is not allowed in the mains
// and you are very likely to be warned and/or banned.

// TODO:
// - Random/several replacements.
// - Unicode strip?
// - Proper help pop-up.
// - Remove swearWords entries which are already bypassed by a previous word.
//      - anal -> analingus, analsex

// FIXME:
// - Words in URLs are replaced as well. This is a cute butt.
//      - Alternatively, strip 0x00ad characters from words matching http.
//      - Alternatively, strip 0x00ad characters within brackets, [].
//      - Strip all BBCode and re-add it.
//          - `words str` then match? What about "a[b]c[/b]d"? That's one word.
// - Stuttering breaks everything. Ignore URLs and BBCode.
//      - This should be possible in the `stutter' function itself.
//      - Is currently broken as well? Make it just werk.

var storage = "text_replace0";
var replacers = { "0": "words"
                , "1": "regular"
                , "2": "regex"
                }

// swearWords :: [Object]
var swearWords = [
      { m: "anal", r: "a­nal" }
    , { m: "analingus", r: "a­nalingus" }
    , { m: "analsex", r: "a­nalsex" }
    , { m: "anus", r: "a­nus" }
    , { m: "ass hole", r: "a­ss hole" }
    , { m: "ass-hole", r: "a­ss-hole" }
    , { m: "asshole", r: "a­sshole" }
    , { m: "bitch", r: "b­itch" }
    , { m: "blowjob", r: "b­lowjob" }
    , { m: "butthole", r: "b­utthole" }
    , { m: "buttplug", r: "b­uttplug" }
    , { m: "buttsex", r: "b­uttsex" }
    , { m: "cannabis", r: "c­annabis" }
    , { m: "chink", r: "c­hink" }
    , { m: "circlejerk", r: "c­irclejerk" }
    , { m: "clit", r: "c­lit" }
    , { m: "clitoris", r: "c­litoris" }
    , { m: "cock", r: "c­ock" }
    , { m: "cocksucker", r: "c­ocksucker" }
    , { m: "cornhole", r: "c­ornhole" }
    , { m: "cum", r: "c­um" }
    , { m: "cumshot", r: "c­umshot" }
    , { m: "cunnilingus", r: "c­unnilingus" }
    , { m: "cunt", r: "c­unt" }
    , { m: "cuntlick", r: "c­untlick" }
    , { m: "cunts", r: "c­unts" }
    , { m: "dickhead", r: "d­ickhead" }
    , { m: "douchebag", r: "d­ouchebag" }
    , { m: "dyke", r: "d­yke" }
    , { m: "f*ck", r: "f­*ck" }
    , { m: "fag", r: "f­ag" }
    , { m: "faggot", r: "f­aggot" }
    , { m: "fcuk", r: "f­cuk" }
    , { m: "fellatio", r: "f­ellatio" }
    , { m: "fok", r: "f­ok" }
    , { m: "fuck", r: "f­uck" }
    , { m: "fucked", r: "f­ucked" }
    , { m: "fucker", r: "f­ucker" }
    , { m: "fucking", r: "f­ucking" }
    , { m: "fudgepacker", r: "f­udgepacker" }
    , { m: "gay", r: "g­ay" }
    , { m: "gook", r: "g­ook" }
    , { m: "hentai", r: "h­entai" }
    , { m: "homo", r: "h­omo" }
    , { m: "kkk", r: "k­k­k" }
    , { m: "klan", r: "k­lan" }
    , { m: "lemonparty", r: "l­emonparty" }
    , { m: "lesbian", r: "l­esbian" }
    , { m: "lesbo", r: "l­esbo" }
    , { m: "masterbat", r: "m­asterbat" }
    , { m: "masturbat", r: "m­asturbat" }
    , { m: "nazi", r: "n­azi" }
    , { m: "nigga", r: "n­igga" }
    , { m: "nigger", r: "n­igger" }
    , { m: "pedophile", r: "p­edophile" }
    , { m: "pedophilia", r: "p­edophilia" }
    , { m: "penis", r: "p­enis" }
    , { m: "phallus", r: "p­hallus" }
    , { m: "phuck", r: "p­huck" }
    , { m: "porn", r: "p­orn" }
    , { m: "pornography", r: "p­ornography" }
    , { m: "pothead", r: "p­othead" }
    , { m: "pron", r: "p­ron" }
    , { m: "pussy", r: "p­ussy" }
    , { m: "queer", r: "q­ueer" }
    , { m: "rape", r: "r­ape" }
    , { m: "rimjob", r: "r­imjob" }
    , { m: "rimming", r: "r­imming" }
    , { m: "sadomasochism", r: "s­adomasochism" }
    , { m: "scheiss", r: "s­cheiss" }
    , { m: "scrotum", r: "s­crotum" }
    , { m: "sexual", r: "s­exual" }
    , { m: "sh!t", r: "s­h!t" }
    , { m: "sh*t", r: "s­h*t" }
    , { m: "shit", r: "s­hit" }
    , { m: "shitt", r: "s­hitt" }
    , { m: "shitting", r: "s­hitting" }
    , { m: "shitty", r: "s­hitty" }
    , { m: "smegma", r: "s­megma" }
    , { m: "spic", r: "s­pic" }
    , { m: "splooge", r: "s­plooge" }
    , { m: "strapon", r: "s­trapon" }
    , { m: "strap-on", r: "s­trap-on" }
    , { m: "tit", r: "t­it" }
    , { m: "tubgirl", r: "t­ubgirl" }
    , { m: "vagina", r: "v­agina" }
    , { m: "vulva", r: "v­ulva" }
    ]

// examples :: String
examples = "Regular:\\n\
banana → apple\\n\
fuck → hold hands\\n\\n\
\
Regex:\\n\
/banana/ig → apple\\n\
/fuck(er|ing)?/ig → hold$1 hands\
";

// buttonsElem :: String
buttonsElem = "\
<div class=formgroup1 id=text_replace>\
    <select id=text_replace_select>\
        <option value=0>words</option>\
        <option value=1>regular</option>\
        <option value=2>regex</option>\
    </select>\
    <input type=input id=text_replace_matcher placeholder=\"Matching text\" title=\"Matching text\" />\
    <input type=input id=text_replace_replacer placeholder=\"Replacement text\" title=\"Replacement text\" />\
    <br /><br />\
    <input type=button id=text_replace_add value=add />\
    <input type=button id=text_replace_edit value=edit />\
    <input type=button id=text_replace_rem value=remove />\
    <input type=button id=text_replace_merge value=merge />\
    <input type=checkbox name=tw title=\"disable cursing\" />\
    <input type=checkbox name=ts title=\"enable stuttering\" />\
    <input type=checkbox name=tr title=\"disable replacing\" />\
    <br /><br />\
    <a href=\"javascript:alert('" + examples + "');\">Examples</a>\
</div>";

// textStyle :: String
textStyle = "\
#text_replace input[type='button'], #text_replace select {\
    background-color: #1b1d1f;\
    color: #b0b0b0;\
    border: 1px solid #707070;\
    font-size: 9pt;\
    font-family: arial;\
    cursor: pointer;\
}\
\
#text_replace input[type='button']:hover, #text_replace select:hover {\
    background-color: #17668a;\
    border: 1px solid #56aacd;\
}\
\
#text_replace input[type='checkbox'] {\
    margin-left: 5px;\
}\
";

// isUpper :: Char -> Bool
function isUpper(x){
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(x) != -1;
}

// toLower, toUpper :: Char -> Char
function toLower(x){ return x.toLowerCase(); }
function toUpper(x){ return x.toUpperCase(); }

// | Apply a function to each element of a list.
// map :: (a -> b) -> [a] -> [b]
function map(f, xs){
    var tmp = [];
    for (x in xs) tmp.push(f(xs[x]));
    return tmp;
}

function filter(f, xs){
    var tmp = [];
    for (x in xs) if (f(xs[x])) tmp.push(xs[x]);
    return tmp;
}

// and :: [Bool] -> Bool
function and(bs){
    var b = true;
    for (i in bs){
        b = b ? bs[i] : false;
    }
    return b;
}

// all :: (a -> Bool) -> [a] -> Bool
function all(f, xs){ return and(map(f, xs)); }

// | Curried functions.
// c :: (a -> b -> c) -> a -> (b -> c)
function c(f, a){
    return function(b){ return f(a,b); }
}

// | Compose two functions.
// co :: (b -> c) -> (a -> b) -> (a -> c)
function co(f, g){
    return function (x){ return f(g(x)); }
}

// | Flip a function's arguments.
// flip :: (a -> b -> c) -> (b -> a -> c)
function flip(f){
    return function(y, x){ return f(x, y); }
}

// range :: Int -> Int -> [Int]
function range(n, m){
    var tmp = [];
    for (i = n; i < m; i++){
        tmp.push(n);
    }
    return tmp;
}

// keys :: Object -> [Key]
function keys(o){
    var tmp = new Array();
    for (k in o) tmp.push(k);
    return tmp;
}

// breaks :: String -> (Char -> Bool) -> [String]
function breaks(s, f){
    var arr = [""];
    var n = 0;
    var b = false;
    for (i = 0; i < s.length; i++){
        if (f(s[i]) && !b){
            n += 1;
            arr.push(s[i]);
            b = true;
        } else if (f(s[i]) && b){
            var t = arr.pop();
            arr.push(t + s[i]);
        } else if (b) {
            n += 1;
            arr.push(s[i]);
            b = false;
        } else {
            var t = arr.pop();
            arr.push(t + s[i]);
        }
    }
    return arr;
}

// isAlphabet :: Char -> Bool
function isAlphabet(x){
    var as = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return (as.indexOf(x) != -1);
}

// not :: Bool -> Bool
function not(b){ return !b; }

// escapeRegExp :: String -> String
function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

// insert :: String -> a -> [Object] -> [Object]
function insert(k, a, o){
    var b = true;
    for (i in o){
        if (k === o[i].m){
            o[i].r = a;
            b = false;
            break;
        }
    }
    if (b) o.push({ m: k, r: a });
    return o;
}

// deleteKey :: String -> [Object] -> [Object]
function deleteKey(k, o){
    var tmp = [];
    for (i in o) if (o[i].m !== k) tmp.push(o[i]);
    return tmp;
}

// convertOldDict :: Object -> [Object]
function convertOldDict(o){
    var no = [];
    for (k in o) no.push({ m: k, r: o[k] });
    return no;
}

// mergeDicts :: [Object] -> [Object] -> [Object]
function mergeDicts(o, p){
    for (i in p){
        o = insert(p[i].m, p[i].r, o);
    }
    return o;
}

// addDict :: IO ()
function addDict(){
    var list;
    var opts = document.getElementById("text_replace_select").children;
    var opt;
    var matcher = document.getElementById("text_replace_matcher");
    var replacer = document.getElementById("text_replace_replacer");
    for (e in opts)
        if (opts[e].selected)
            opt = replacers[opts[e].value];
    try {
        list = JSON.parse(localStorage[storage + opt]);
        if (!(list instanceof Array))
            list = JSON.stringify(convertOldDict(list));
    } catch(e) {
        console.log("addDict: " + e);
        list = [];
    }
    if (matcher.value != ""){
        var obj = { m: matcher.value, r: replacer.value }
        var nlist = mergeDicts(list, [obj]);
        localStorage[storage + opt] = JSON.stringify(nlist);
        matcher.value = "";
        replacer.value = "";
    } else console.log("addDict: matcher is empty.");
}

// remDict :: IO ()
function remDict(){
    var opts = document.getElementById("text_replace_select").children;
    var opt;
    var matcher = document.getElementById("text_replace_matcher");
    for (e in opts)
        if (opts[e].selected){
            console.log("Converting...");
            opt = replacers[opts[e].value];
        }
    try {
        list = JSON.parse(localStorage[storage + opt]);
        if (!(list instanceof Array))
            list = convertOldDict(list);
    } catch(e) {
        console.log("addDict: " + e);
        list = [];
    }
    if (matcher.value != ""){
        var nlist = deleteKey(matcher.value, list);
        localStorage[storage + opt] = JSON.stringify(nlist);
        matcher.value = "";
        document.getElementById("text_replace_replacer").value = "";
    } else console.log("remDict: matcher is empty.");
}

// editDict :: IO ()
function editDict(){
    var list;
    var opts = document.getElementById("text_replace_select").children;
    var opt;
    for (e in opts)
        if (opts[e].selected)
            opt = replacers[opts[e].value];
    try {
        var str = localStorage[storage + opt];
        JSON.parse(str);
        list = str;
    } catch(e) {
        list = "[]";
    }

    var f = function(e){
        var text = this.children[0].children[0];
        try {
            var o = JSON.parse(text.value);
            if (!(o instanceof Array))
                text.value = JSON.stringify(convertOldDict(o));
            localStorage[storage + opt] = text.value;
        } catch(e) {
            if (!confirm("Incorrect JSON. Do you still want to save? This will reset `" + opt + "' to an empty dictionary."))
                return false;
            else localStorage[storage + opt] = "[]";
        }
        this.parentNode.removeChild(this);
        }

    mkEditor(list, f);
}

// mergeDict :: IO ()
function mergeDict(){
    var opts = document.getElementById("text_replace_select").children;
    var opt;
    for (e in opts)
        if (opts[e].selected)
            opt = replacers[opts[e].value];

    var f = function(e){
        var text = this.children[0].children[0];
        try {
            var o = JSON.parse(text.value);
            console.log(o);
            if (!(o instanceof Array))
                o = convertOldDict(o);
            console.log(o);
            var odict = JSON.parse(localStorage[storage + opt]);
            o = mergeDicts(odict, o);
            console.log(o);
            localStorage[storage + opt] =
                JSON.stringify(o);
        } catch(e) {
            console.log("mergeDict: " + e);
            if (!confirm("Incorrect JSON. Do you still want to save? This will reset `" + opt + "' to an empty dictionary."))
                return false;
            else localStorage[storage + opt] = "[]";
        }
        this.parentNode.removeChild(this);
        }

    mkEditor("[]", f);
}

// mkEditor :: String -> (Event -> IO ()) -> IO ()
function mkEditor(str, f){
    var wrap = document.createElement("div");
    var iwrap = document.createElement("div");
    var text = document.createElement("textarea");
    wrap.style.width = "100%";
    wrap.style.height = "100%";
    wrap.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    wrap.style.position = "fixed";
    wrap.style.top = "0";
    wrap.style.zIndex = "3939";
    iwrap.style.width = "640px";
    iwrap.style.top = "0";
    iwrap.style.margin = "10% auto auto auto";
    text.style.maxWidth = "640px";
    text.style.maxHeight = "480px";
    text.style.width = "640px";
    text.style.height = "480px";
    text.style.display = "block";
    text.align = "center";
    text.value = str;

    wrap.addEventListener("click", f);
    text.addEventListener("click", function(e){
        if (e && e.stopPropagation) e.stopPropagation();
        else e.cancelBubble = true;
        return false;
    });

    iwrap.appendChild(text);
    wrap.appendChild(iwrap);
    document.getElementsByTagName("body")[0].appendChild(wrap);
    text.focus();
    text.select();
}

// toggleOpt :: IO ()
function toggleOpt(){
    localStorage[storage + this.name] = this.checked;
    if (this.name == "tw"){
        if (this.checked) censor();
        else uncensor();
    } else if (this.name == "ts"){
        if (this.checked) uncensor();
    }
}

// stutter :: String -> IO String
function stutter(x){
    var f = function(s){
        var n = Math.floor(Math.random() * Math.floor(s.length / 2));
        if (n == 0) return s;
        else if (s.match(/\[\/?(i|b|u|url|quote)\]/i)) return s;
        else return f(s.slice(0, n)) + '-' + s;
    }
    return map(f, x.split(' ')).join(' ');
}

// copyCase :: String -> String -> String
function copyCase(strx, stry){
    if (all(isUpper, strx)){
        return stry.toUpperCase();
    } else if (isUpper(strx[0])){
        return stry[0].toUpperCase() + stry.slice(1);
    } else {
        return stry;
    }
}

// censor :: IO ()
function censor(){
    var elems = [];
    elems.push("ctl00_mainContent_postForm_skin_body");
    elems.push("ctl00_mainContent_postForm_skin_subject");
    elems.push("ctl00_mainContent_messageForm_skin_body");
    elems.push("ctl00_mainContent_messageForm_skin_subject");
    for (i = 0; i < elems.length; i++){
        var e = document.getElementById(elems[i]);
        if (e != undefined && e != null)
            e.value = e.value.replace(/­/g, "");
    }
    return true;
}

// wordsReplace :: [Object] -> String -> String
function wordsReplace(dict, txt){
    var result = "";
    var txtbreaks = breaks(txt, isAlphabet);
    for (i in txtbreaks){
        var wo = txtbreaks[i];
        for (j in dict)
            if (dict[j].m == wo.toLowerCase())
                wo = copyCase(wo, dict[j].r);
        result += wo;
    }
    return result;
}

// regularReplace :: [Object] -> String -> String
function regularReplace(dict, txt){
    for (i in dict){
        var match = new RegExp(escapeRegExp(dict[i].m), "ig");
        txt = txt.replace(match, c(flip(copyCase), dict[i].r));
    }
    return txt;
}

function regexReplace(dict, txt){
    try {
        for (i in dict){
            var tmp = dict[i].m.split('/').splice(1);
            var regex = tmp.splice(0, tmp.length - 1).join('/');
            var args = tmp.splice(-1);
            var match = new RegExp(regex, args);
            txt = txt.replace(match, c(flip(copyCase), dict[i].r));
        }
    } catch(e){
        console.log("Incorrect RegExp pattern: " + dict[i].m);
    }
    return txt;
}

// uncensor :: IO ()
function uncensor(){
    var br = true;
    var bPost = document.getElementById("ctl00_mainContent_postForm_skin_body");
    var sPost = document.getElementById("ctl00_mainContent_postForm_skin_subject");
    var bMsg = document.getElementById("ctl00_mainContent_messageForm_skin_body");
    var sMsg = document.getElementById("ctl00_mainContent_messageForm_skin_subject");
    var belem = bPost || bMsg;
    var selem = sPost || sMsg;
    var elems = [belem, selem];
    elems = filter(function(x){ return x != null }, elems);
    console.log(elems);
    try {
        if (JSON.parse(localStorage[storage + "tr"]))
            br = false;
    } catch(e) {}
    for (var x = 0; x < elems.length; x++){
        var txt = elems[x].value;
        if (br){
            var dict = {};
            for (k in replacers){
                var v = replacers[k];
                try {
                    var rs = JSON.parse(localStorage[storage + v]);
                    dict[v] = rs;
                } catch(e){
                    console.log("Error parsing `" + v + "': " + e);
                }
            }
            for (t in dict){
                if (t == "words"){
                    console.log("uncensor: Replacing words.");
                    try {
                        txt = wordsReplace(dict[t], txt);
                    } catch(e) {
                        console.log("uncensor: wordReplace error: " + e);
                    }
                } else if (t == "regular"){
                    console.log("uncensor: Replacing regular.");
                    try {
                        txt = regularReplace(dict[t], txt);
                    } catch(e){
                        console.log("uncensor: regularReplace error: " + e);
                    }
                } else if (t == "regex"){
                    console.log("uncensor: Replacing regex.");
                    try {
                        txt = regexReplace(dict[t], txt);
                    } catch(e) {
                        console.log("uncensor: regexReplace error: " + e);
                    }
                } else if (t == "random"){
                    // TODO
                }
            }
        }
        if (window.location.href.match(/https?:\/\/\S+.bungie.net\/fanclub/i)){
            var b = true;
            try {
                if (JSON.parse(localStorage[storage + "tw"]))
                    b = false;
            } catch(e) {}
            if (b){
                txt = regularReplace(swearWords, txt);
            }
        }
        try {
            if (JSON.parse(localStorage[storage + "ts"]))
                txt = stutter(txt);
        } catch(e) {}
        elems[x].value = txt;
    }
    return true;
}

// WebForm :: String -> String -> IO ()
function WebForm(elem, listener, type, buttonType){
    var formtype;
    if (type == "forum" || type == "post"){
        type = "post";
        formtype = "forum";
    } else if (type == "message"){
        formtype = type + "form";
    }
    if (formtype != undefined){
        uncensor();
        var webForm = "javascript:WebForm_DoPostBackWithOptions(new WebForm_PostBackOptions(\"ctl00$mainContent$" + type + "Form$skin$" + buttonType + "\", \"\", true, \"" + formtype + "\", \"\", false, true))";
        elem.href = webForm;
        elem.removeEventListener("click", listener);
        //triggerClick(elem);
    } else {
        console.log("WebForm: This `type' is unknown.");
    }
}

// triggerClick :: Element -> IO ()
function triggerClick(elem){
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent("click", true, true);
    elem.dispatchEvent(evt);
}

// userInterface :: IO ()
function userInterface(){
    var e = document.getElementsByClassName("formgroup3")[0];
    if (e.nextSibling){
        console.log("NextSibling");
        var p = document.createElement("p");
        p.appendChild(e.nextSibling);
        p.innerHTML += buttonsElem;
        var elem = p.children[0];
        e.parentNode.insertBefore(elem, e.nextSibling);
    } else {
        console.log("NoSiblings");
        e.parentNode.innerHTML += buttonsElem;
    }
    var style = document.createElement("style");
    style.type = "text/css";
    style.innerHTML = textStyle;
    document.getElementsByTagName("head")[0].appendChild(style);
}

// bindings :: IO ()
function bindings(){
    var postArea = document.getElementById("ctl00_mainContent_postForm_skin_body");
    var postSubject = document.getElementById("ctl00_mainContent_postForm_skin_subject");
    var postSubmit = document.getElementById("ctl00_mainContent_postForm_skin_submitButton");
    var postPreview = document.getElementById("ctl00_mainContent_postForm_skin_previewButton");

    var msgArea = document.getElementById("ctl00_mainContent_messageForm_skin_body");
    var msgSubject = document.getElementById("ctl00_mainContent_messageForm_skin_subject");
    var msgSubmit = document.getElementById("ctl00_mainContent_messageForm_skin_submitButton");
    var msgPreview = document.getElementById("ctl00_mainContent_messageForm_skin_previewButton");

    var showButton = document.getElementById("text_replace_edit");
    var addButton = document.getElementById("text_replace_add");
    var remButton = document.getElementById("text_replace_rem");
    var mergeButton = document.getElementById("text_replace_merge");
    var checkBoxes = document.getElementById("text_replace").children;

    showButton.addEventListener("click", editDict);
    mergeButton.addEventListener("click", mergeDict);
    addButton.addEventListener("click", addDict);
    remButton.addEventListener("click", remDict);

    try {
        postSubmit.href = "javascript:;";
        postSubmit.addEventListener("click", function(){
            WebForm(this, arguments.callee, "post", "submitButton");
        });
        postPreview.href = "javascript:;";
        postPreview.addEventListener("click", function(){
            WebForm(this, arguments.callee, "post", "previewButton");
        });
    } catch(e){
        try {
            msgSubmit.href = "javascript:;";
            msgSubmit.addEventListener("click", function(){
                WebForm(this, arguments.callee, "message", "submitButton");
            });
            msgPreview.href = "javascript:;";
            msgPreview.addEventListener("click", function(){
                WebForm(this, arguments.callee, "message", "previewButton");
            });
        } catch(e){
            console.log("bindings: No elements found.");
        }
    }

    for (e in checkBoxes){
        if (checkBoxes[e].type == "checkbox"){
            var n = checkBoxes[e].name;
            try {
                if (JSON.parse(localStorage[storage + n]))
                    checkBoxes[e].checked = true;
            } catch(e) {}
            checkBoxes[e].addEventListener("change", toggleOpt);
        }
    }
}

// main :: IO ()
function main(){
    userInterface();
    bindings();
    console.log(stutter("I like to eat bananas for dinner. Yeah."));
}

main();
