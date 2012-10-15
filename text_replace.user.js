// ==UserScript==
// @name            text_replace
// @namespace       --
// @description     Replace text on submit on Bungie.net
// @version         0.1
// @include         http*://*bungie.net/*createpost.aspx*
// @author          Shou
// @copyright       2012, Shou
// @license	        (CC) Attribution Non-Commercial Share Alike; http://creativecommons.org/licenses/by-nc-sa/3.0/
// ==/UserScript==


// Please note that bypassing the swear word filter is not allowed in the mains
// and you are very likely to be warned and/or banned.

// TODO:
// - Add a way to toggle replacement of swear words and/or user added words.
// - Add a way to add word replacements, store in localStorage.
// - Export/import swear word dictionaries.
// - Case insensitive matching.
//      - RegExp for case insensitive matching, escape the strings
//      - toCaseResult() will not work for anything other than swear words.
//          - We need to match the old String's case against the new one and
//            add according to that.
// - Random/several replacements.
// - S-stu-stuttering.
// - Match modes
//      - Regex
//      - Regular (escaped regex)

// FIXME:
// - Words in URLs are replaced as well. This is a cute butt.
//      - Split on words and do not replace the word if it contains an URL.

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
swearWords["kkk"] = "k­kk";
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

buttonsElem = "<div class=formgroup3><input type=button id=";

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

// censor :: IO ()
function censor(){
    var elem = document.getElementById("ctl00_mainContent_postForm_skin_body");
    elem.value = elem.value.replace('­', "");
    return true;
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

// uncensor :: IO ()
function uncensor(){
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
            console.log("Regular!");
            for (i in dict[t]){
                var match = new RegExp(escapeRegExp(i), "ig");
                txt = txt.replace(match, c(flip(copyCase), dict[t][i]));
            }
        } else if (t == "regex"){
            console.log("Regex!");
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
        }
    }
    if (window.location.href.match(/https?:\/\/\S+.bungie.net\/fanclub/i)){
        console.log("Swear words!");
        for (i in swearWords){
            var match = new RegExp(escapeRegExp(i), "ig");
            txt = txt.replace(match, c(flip(copyCase), swearWords[i]));
        }
    }
    elem.value = txt;
    return true;
}

// bindings :: IO ()
function bindings(){
    var previewButton = document.getElementById("ctl00_mainContent_postForm_skin_previewButton");
    var submitButton = document.getElementById("ctl00_mainContent_postForm_skin_previewButton");
    previewButton.addEventListener("click", uncensor);
    submitButton.addEventListener("click", uncensor);
}

// main :: IO ()
function main(){
    bindings();
}

main();
