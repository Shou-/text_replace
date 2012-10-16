// ==UserScript==
// @name            text_replace
// @namespace       https://github.com/Shou-/text_replace
// @description     Replace text on submit on Bungie.net
// @version         0.39
// @include         http*://*bungie.net/*createpost.aspx*
// @author          Shou
// @copyright       2012, Shou
// @license	        (CC) Attribution Non-Commercial Share Alike; http://creativecommons.org/licenses/by-nc-sa/3.0/
// @updateURL       https://github.com/Shou-/text_replace/raw/master/text_replace.user.js
// ==/UserScript==


// Please note that bypassing the swear word filter is not allowed in the mains
// and you are very likely to be warned and/or banned.

// TODO:
// - Random/several replacements.

// FIXME:
// - Words in URLs are replaced as well. This is a cute butt.
//      - Split on words and do not replace the word if it contains an URL.
//      - Alternatively, strip 0x00ad characters from words matching http.
//      - Alternatively, strip 0x00ad characters within brackets, [].

var storage = "text_replace0";
var matchtypes = ["regex", "regular"];

// swearWords :: [(String, String)]
var swearWords = new Array();
swearWords["anal"] = "a­nal";
swearWords["analingus"] = "a­nalingus";
swearWords["analsex"] = "a­nalsex";
swearWords["anus"] = "a­nus";
swearWords["ass hole"] = "a­ss hole";
swearWords["ass-hole"] = "a­ss-hole";
swearWords["asshole"] = "a­sshole";
swearWords["bitch"] = "b­itch";
swearWords["blowjob"] = "b­lowjob";
swearWords["butthole"] = "b­utthole";
swearWords["buttplug"] = "b­uttplug";
swearWords["buttsex"] = "b­uttsex";
swearWords["cannabis"] = "c­annabis";
swearWords["chink"] = "c­hink";
swearWords["circlejerk"] = "c­irclejerk";
swearWords["clit"] = "c­lit";
swearWords["clitoris"] = "c­litoris";
swearWords["cock"] = "c­ock";
swearWords["cocksucker"] = "c­ocksucker";
swearWords["cornhole"] = "c­ornhole";
swearWords["cum"] = "c­um";
swearWords["cumshot"] = "c­umshot";
swearWords["cunnilingus"] = "c­unnilingus";
swearWords["cunt"] = "c­unt";
swearWords["cuntlick"] = "c­untlick";
swearWords["cunts"] = "c­unts";
swearWords["dickhead"] = "d­ickhead";
swearWords["douchebag"] = "d­ouchebag";
swearWords["dyke"] = "d­yke";
swearWords["f*ck"] = "f­*ck";
swearWords["fag"] = "f­ag";
swearWords["faggot"] = "f­aggot";
swearWords["fcuk"] = "f­cuk";
swearWords["fellatio"] = "f­ellatio";
swearWords["fok"] = "f­ok";
swearWords["fuck"] = "f­uck";
swearWords["fucked"] = "f­ucked";
swearWords["fucker"] = "f­ucker";
swearWords["fucking"] = "f­ucking";
swearWords["fudgepacker"] = "f­udgepacker";
swearWords["gay"] = "g­ay";
swearWords["gook"] = "g­ook";
swearWords["hentai"] = "h­entai";
swearWords["homo"] = "h­omo";
swearWords["kkk"] = "k­k­k";
swearWords["klan"] = "k­lan";
swearWords["lemonparty"] = "l­emonparty";
swearWords["lesbian"] = "l­esbian";
swearWords["lesbo"] = "l­esbo";
swearWords["masterbate"] = "m­asterbate";
swearWords["masturbate"] = "m­asturbate";
swearWords["nazi"] = "n­azi";
swearWords["nigga"] = "n­igga";
swearWords["nigger"] = "n­igger";
swearWords["pedophile"] = "p­edophile";
swearWords["pedophilia"] = "p­edophilia";
swearWords["penis"] = "p­enis";
swearWords["phallus"] = "p­hallus";
swearWords["phuck"] = "p­huck";
swearWords["porn"] = "p­orn";
swearWords["pornography"] = "p­ornography";
swearWords["pothead"] = "p­othead";
swearWords["pron"] = "p­ron";
swearWords["pussy"] = "p­ussy";
swearWords["queer"] = "q­ueer";
swearWords["rape"] = "r­ape";
swearWords["rimjob"] = "r­imjob";
swearWords["rimming"] = "r­imming";
swearWords["sadomasochism"] = "s­adomasochism";
swearWords["scheiss"] = "s­cheiss";
swearWords["scrotum"] = "s­crotum";
swearWords["sexual"] = "s­exual";
swearWords["sh!t"] = "s­h!t";
swearWords["sh*t"] = "s­h*t";
swearWords["shit"] = "s­hit";
swearWords["shitt"] = "s­hitt";
swearWords["shitting"] = "s­hitting";
swearWords["shitty"] = "s­hitty";
swearWords["smegma"] = "s­megma";
swearWords["spic"] = "s­pic";
swearWords["splooge"] = "s­plooge";
swearWords["strapon"] = "s­trapon";
swearWords["strap-on"] = "s­trap-on";
swearWords["tit"] = "t­it";
swearWords["tubgirl"] = "t­ubgirl";
swearWords["vagina"] = "v­agina";
swearWords["vulva"] = "v­ulva";

examples = "Regular:\\n\
banana → apple\\n\
fuck → hold hands\\n\\n\
\
Regex:\\n\
/banana/ig → apple\\n\
/fuck(er|ing)?/ig → hold$1 hands\
";

buttonsElem = "\
<div class=formgroup1 id=text_replace>\
    <select id=text_replace_select>\
        <option value=0>regular</option>\
        <option value=1>regex</option>\
    </select>\
    <input type=input id=text_replace_matcher placeholder=\"Matching text\" title=\"Matching text\" />\
    <input type=input id=text_replace_replacer placeholder=\"Replacement text\" title=\"Replacement text\" />\
    <br /><br />\
    <input type=button id=text_replace_add value=add />\
    <input type=button id=text_replace_show value=edit />\
    <input type=checkbox name=tw title=\"disable cursing\" />\
    <input type=checkbox name=ts title=\"enable stuttering\" />\
    <input type=checkbox name=tr title=\"disable replacing\" />\
    <br /><br />\
    <a href=\"javascript:alert('" + examples + "');\">Examples</a>\
</div>";

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

// | Compose two functions.
// c :: (a -> b -> c) -> a -> (b -> c)
function c(f, a){
    return function(b){ return f(a,b) }
}

// | Flip a function's arguments.
// flip :: (a -> b -> c) -> (b -> a -> c)
function flip(f){
    return function(y, x){ return f(x, y); }
}

// range :: Int -> Int -> [Int]
function range(n, m){
    var tmp = [];
    for(i = n; i < m; i++){
        tmp.push(n);
    }
    return tmp;
}

// escapeRegExp :: String -> String
function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

// addDict :: IO ()
function addDict(){
    var obj;
    var opts = document.getElementById("text_replace_select").children;
    var opt;
    var matcher = document.getElementById("text_replace_matcher");
    var replacer = document.getElementById("text_replace_replacer");
    for (e in opts)
        if (opts[e].selected)
            opt = opts[e].value == 0 ? "regular" : "regex";
    try {
        obj = JSON.parse(localStorage[storage + opt]);
    } catch(e) {
        obj = {};
    }
    obj[matcher.value] = replacer.value;
    localStorage[storage + opt] = JSON.stringify(obj);
    matcher.value = "";
    replacer.value = "";
}

// showDict :: IO ()
function showDict(){
    var obj;
    var opts = document.getElementById("text_replace_select").children;
    var opt;
    for (e in opts)
        if (opts[e].selected)
            opt = opts[e].value == 0 ? "regular" : "regex";
    try {
        var str = localStorage[storage + opt];
        JSON.parse(str);
        obj = str;
    } catch(e) {
        obj = "{}";
    }
    var wrap = document.createElement("div");
    var text = document.createElement("textarea");
    wrap.style.width = "100%";
    wrap.style.height = "100%";
    wrap.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    wrap.style.position = "fixed";
    wrap.style.top = "0";
    wrap.style.zIndex = "3939";
    text.style.maxWidth = "640px";
    text.style.maxHeight = "480px";
    text.style.width = "640px";
    text.style.height = "480px";
    text.style.display = "block";
    text.align = "center";
    wrap.addEventListener("click",
        function(e){
            try {
                var o = JSON.parse(text.value);
                localStorage[storage + opt] = text.value;
            } catch(e) {
                if (!confirm("Incorrect JSON. Do you still want to save? This will reset `" + opt + "' to an empty dictionary."))
                    return false;
                else localStorage[storage + opt] = "{}";
            }
            this.parentNode.removeChild(this);
        }
    );
    text.addEventListener("click",
        function(e){
            if (e && e.stopPropagation) e.stopPropagation();
            else e.cancelBubble = true;
            return false;
        }
    );
    text.value = obj;
    wrap.appendChild(text);
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
        else return f(s.slice(0, n)) + '-' + s;
    }
    return map(f, x.split(' ')).join(' ');
}

// copyCase :: String -> String -> String
function copyCase(strx, stry){
    if (all(isUpper, strx)){
        return stry.toUpperCase();
    }
    else if (isUpper(strx[0])){
        return stry[0].toUpperCase() + stry.slice(1);
    }
    else {
        return stry;
    }
}

// censor :: IO ()
function censor(){
    var elem = document.getElementById("ctl00_mainContent_postForm_skin_body");
    elem.value = elem.value.replace(/­/g, "");
    return true;
}

// uncensor :: IO ()
function uncensor(){
    var br = true;
    try {
        if (JSON.parse(localStorage[storage + "tr"]))
            br = false;
    } catch(e) {}
    if (br){
        var elem = document.getElementById("ctl00_mainContent_postForm_skin_body");
        var txt = elem.value;
        var dict = {};
        for (i in matchtypes){
            try {
                var rs = JSON.parse(localStorage[storage + matchtypes[i]]);
                dict[matchtypes[i]] = rs;
            } catch(e){
                console.log("Error parsing `" + matchtypes[i] + "': " + e);
            }
        }
        for (t in dict){
            if (t == "regular"){
                for (i in dict[t]){
                    var match = new RegExp(escapeRegExp(i), "ig");
                    txt = txt.replace(match, c(flip(copyCase), dict[t][i]));
                }
            } else if (t == "regex"){
                try {
                    for (i in dict[t]){
                        var tmp = i.split('/').splice(1);
                        var regex = tmp.splice(0, tmp.length - 1).join('/');
                        var args = tmp.splice(-1);
                        var match = new RegExp(regex, args);
                        txt = txt.replace(match, c(flip(copyCase), dict[t][i]));
                    }
                } catch(e){
                    console.log("Incorrect RegExp pattern: " + i);
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
            for (i in swearWords){
                var match = new RegExp(escapeRegExp(i), "ig");
                txt = txt.replace(match, c(flip(copyCase), swearWords[i]));
            }
        }
    }
    try {
        if (JSON.parse(localStorage[storage + "ts"]))
            txt = stutter(txt);
    } catch(e) {}
    elem.value = txt;
    return true;
}

// userInterface :: IO ()
function userInterface(){
    var e = document.getElementById("ctl00_mainContent_postForm_skin_bodyPanel");
    if (e.nextSibling){
        var p = document.createElement("p");
        p.appendChild(e.nextSibling);
        p.innerHTML += buttonsElem;
        var elem = p.children[0];
        e.parentNode.insertBefore(elem, e.nextSibling);
    }
    else {
        e.parentNode.innerHTML += buttonsElem;
    }
    var style = document.createElement("style");
    style.type = "text/css";
    style.innerHTML = textStyle;
    document.getElementsByTagName("head")[0].appendChild(style);
}

// bindings :: IO ()
function bindings(){
    var textArea = document.getElementById("ctl00_mainContent_postForm_skin_body");
    var showButton = document.getElementById("text_replace_show");
    var addButton = document.getElementById("text_replace_add");
    var checkBoxes = document.getElementById("text_replace").children;
    textArea.addEventListener("blur", uncensor);
    showButton.addEventListener("click", showDict);
    addButton.addEventListener("click", addDict);
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
}

main();
