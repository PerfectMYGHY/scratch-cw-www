
// Process definition lists

function deflist_plugin(md) {
    const isSpace = md.utils.isSpace;
    // Search `[:~][\n ]`, returns next pos after marker on success
    // or -1 on fail.
    function skipMarker(state, line) {
        let start = state.bMarks[line] + state.tShift[line];
        const max = state.eMarks[line];
        if (start >= max) {
            return -1;
        }
        // Check bullet
        const marker = state.src.charCodeAt(start++);
        if (marker !== 126 /* ~ */ && marker !== 58 /* : */) {
            return -1;
        }
        const pos = state.skipSpaces(start);
        // require space after ":"
        if (start === pos) {
            return -1;
        }
        // no empty definitions, e.g. "  : "
        if (pos >= max) {
            return -1;
        }
        return start;
    }
    function markTightParagraphs(state, idx) {
        const level = state.level + 2;
        for (let i = idx + 2, l = state.tokens.length - 2; i < l; i++) {
            if (state.tokens[i].level === level && state.tokens[i].type === "paragraph_open") {
                state.tokens[i + 2].hidden = true;
                state.tokens[i].hidden = true;
                i += 2;
            }
        }
    }
    function deflist(state, startLine, endLine, silent) {
        if (silent) {
            // quirk: validation mode validates a dd block only, not a whole deflist
            if (state.ddIndent < 0) {
                return false;
            }
            return skipMarker(state, startLine) >= 0;
        }
        let nextLine = startLine + 1;
        if (nextLine >= endLine) {
            return false;
        }
        if (state.isEmpty(nextLine)) {
            nextLine++;
            if (nextLine >= endLine) {
                return false;
            }
        }
        if (state.sCount[nextLine] < state.blkIndent) {
            return false;
        }
        let contentStart = skipMarker(state, nextLine);
        if (contentStart < 0) {
            return false;
        }
        // Start list
        const listTokIdx = state.tokens.length;
        let tight = true;
        const token_dl_o = state.push("dl_open", "dl", 1);
        const listLines = [startLine, 0];
        token_dl_o.map = listLines;

        // Iterate list items

        let dtLine = startLine;
        let ddLine = nextLine;
      // One definition list can contain multiple DTs,
      // and one DT can be followed by multiple DDs.

      // Thus, there is two loops here, and label is
      // needed to break out of the second one

      /* eslint no-labels:0,block-scoped-var:0 */      OUTER: for (; ;) {
            let prevEmptyEnd = false;
            const token_dt_o = state.push("dt_open", "dt", 1);
            token_dt_o.map = [dtLine, dtLine];
            const token_i = state.push("inline", "", 0);
            token_i.map = [dtLine, dtLine];
            token_i.content = state.getLines(dtLine, dtLine + 1, state.blkIndent, false).trim();
            token_i.children = [];
            state.push("dt_close", "dt", -1);
            for (; ;) {
                const token_dd_o = state.push("dd_open", "dd", 1);
                const itemLines = [nextLine, 0];
                token_dd_o.map = itemLines;
                let pos = contentStart;
                const max = state.eMarks[ddLine];
                let offset = state.sCount[ddLine] + contentStart - (state.bMarks[ddLine] + state.tShift[ddLine]);
                while (pos < max) {
                    const ch = state.src.charCodeAt(pos);
                    if (isSpace(ch)) {
                        if (ch === 9) {
                            offset += 4 - offset % 4;
                        } else {
                            offset++;
                        }
                    } else {
                        break;
                    }
                    pos++;
                }
                contentStart = pos;
                const oldTight = state.tight;
                const oldDDIndent = state.ddIndent;
                const oldIndent = state.blkIndent;
                const oldTShift = state.tShift[ddLine];
                const oldSCount = state.sCount[ddLine];
                const oldParentType = state.parentType;
                state.blkIndent = state.ddIndent = state.sCount[ddLine] + 2;
                state.tShift[ddLine] = contentStart - state.bMarks[ddLine];
                state.sCount[ddLine] = offset;
                state.tight = true;
                state.parentType = "deflist";
                state.md.block.tokenize(state, ddLine, endLine, true);
                // If any of list item is tight, mark list as tight
                if (!state.tight || prevEmptyEnd) {
                    tight = false;
                }
                // Item become loose if finish with empty line,
                // but we should filter last element, because it means list finish
                prevEmptyEnd = state.line - ddLine > 1 && state.isEmpty(state.line - 1);
                state.tShift[ddLine] = oldTShift;
                state.sCount[ddLine] = oldSCount;
                state.tight = oldTight;
                state.parentType = oldParentType;
                state.blkIndent = oldIndent;
                state.ddIndent = oldDDIndent;
                state.push("dd_close", "dd", -1);
                itemLines[1] = nextLine = state.line;
                if (nextLine >= endLine) {
                    break OUTER;
                }
                if (state.sCount[nextLine] < state.blkIndent) {
                    break OUTER;
                }
                contentStart = skipMarker(state, nextLine);
                if (contentStart < 0) {
                    break;
                }
                ddLine = nextLine;
                // go to the next loop iteration:
                // insert DD tag and repeat checking
            }
            if (nextLine >= endLine) {
                break;
            }
            dtLine = nextLine;
            if (state.isEmpty(dtLine)) {
                break;
            }
            if (state.sCount[dtLine] < state.blkIndent) {
                break;
            }
            ddLine = dtLine + 1;
            if (ddLine >= endLine) {
                break;
            }
            if (state.isEmpty(ddLine)) {
                ddLine++;
            }
            if (ddLine >= endLine) {
                break;
            }
            if (state.sCount[ddLine] < state.blkIndent) {
                break;
            }
            contentStart = skipMarker(state, ddLine);
            if (contentStart < 0) {
                break;
            }
            // go to the next loop iteration:
            // insert DT and DD tags and repeat checking
        }
        // Finilize list
        state.push("dl_close", "dl", -1);
        listLines[1] = nextLine;
        state.line = nextLine;
        // mark paragraphs tight if needed
        if (tight) {
            markTightParagraphs(state, listTokIdx);
        }
        return true;
    }
    md.block.ruler.before("paragraph", "deflist", deflist, {
        alt: ["paragraph", "reference", "blockquote"]
    });
}

function emoji_html(tokens, idx /*, options, env */) {
    return tokens[idx].content;
}

function create_rule(md, emojies, shortcuts, scanRE, replaceRE) {
    const arrayReplaceAt = md.utils.arrayReplaceAt;
    const ucm = md.utils.lib.ucmicro;
    const has = md.utils.has;
    const ZPCc = new RegExp([ucm.Z.source, ucm.P.source, ucm.Cc.source].join("|"));
    function splitTextToken(text, level, Token) {
        let last_pos = 0;
        const nodes = [];
        text.replace(replaceRE, (function (match, offset, src) {
            let emoji_name;
            // Validate emoji name
            if (has(shortcuts, match)) {
                // replace shortcut with full name
                emoji_name = shortcuts[match];
                // Don't allow letters before any shortcut (as in no ":/" in http://)
                if (offset > 0 && !ZPCc.test(src[offset - 1])) return;
                // Don't allow letters after any shortcut
                if (offset + match.length < src.length && !ZPCc.test(src[offset + match.length])) {
                    return;
                }
            } else {
                emoji_name = match.slice(1, -1);
            }
            // Add new tokens to pending list
            if (offset > last_pos) {
                const token = new Token("text", "", 0);
                token.content = text.slice(last_pos, offset);
                nodes.push(token);
            }
            const token = new Token("emoji", "", 0);
            token.markup = emoji_name;
            token.content = emojies[emoji_name];
            nodes.push(token);
            last_pos = offset + match.length;
        }));
        if (last_pos < text.length) {
            const token = new Token("text", "", 0);
            token.content = text.slice(last_pos);
            nodes.push(token);
        }
        return nodes;
    }
    return function emoji_replace(state) {
        let token;
        const blockTokens = state.tokens;
        let autolinkLevel = 0;
        for (let j = 0, l = blockTokens.length; j < l; j++) {
            if (blockTokens[j].type !== "inline") {
                continue;
            }
            let tokens = blockTokens[j].children;
            // We scan from the end, to keep position when new tags added.
            // Use reversed logic in links start/end match
            for (let i = tokens.length - 1; i >= 0; i--) {
                token = tokens[i];
                if (token.type === "link_open" || token.type === "link_close") {
                    if (token.info === "auto") {
                        autolinkLevel -= token.nesting;
                    }
                }
                if (token.type === "text" && autolinkLevel === 0 && scanRE.test(token.content)) {
                    // replace current node
                    blockTokens[j].children = tokens = arrayReplaceAt(tokens, i, splitTextToken(token.content, token.level, state.Token));
                }
            }
        }
    };
}

function quoteRE(str) {
    return str.replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
}

function normalize_opts(options) {
    let emojies = options.defs;
    // Filter emojies by whitelist, if needed
    if (options.enabled.length) {
        emojies = Object.keys(emojies).reduce(((acc, key) => {
            if (options.enabled.indexOf(key) >= 0) acc[key] = emojies[key];
            return acc;
        }), {});
    }
    // Flatten shortcuts to simple object: { alias: emoji_name }
    const shortcuts = Object.keys(options.shortcuts).reduce(((acc, key) => {
        // Skip aliases for filtered emojies, to reduce regexp
        if (!emojies[key]) return acc;
        if (Array.isArray(options.shortcuts[key])) {
            options.shortcuts[key].forEach((alias => {
                acc[alias] = key;
            }));
            return acc;
        }
        acc[options.shortcuts[key]] = key;
        return acc;
    }), {});
    const keys = Object.keys(emojies);
    let names;
    // If no definitions are given, return empty regex to avoid replacements with 'undefined'.
    if (keys.length === 0) {
        names = "^$";
    } else {
        // Compile regexp
        names = keys.map((name => `:${name}:`)).concat(Object.keys(shortcuts)).sort().reverse().map((name => quoteRE(name))).join("|");
    }
    const scanRE = RegExp(names);
    const replaceRE = RegExp(names, "g");
    return {
        defs: emojies,
        shortcuts: shortcuts,
        scanRE: scanRE,
        replaceRE: replaceRE
    };
}
function emoji_plugin$1(md, options) {
    const defaults = {
        defs: {},
        shortcuts: {},
        enabled: []
    };
    const opts = normalize_opts(md.utils.assign({}, defaults, options || {}));
    md.renderer.rules.emoji = emoji_html;
    md.core.ruler.after("linkify", "emoji", create_rule(md, opts.defs, opts.shortcuts, opts.scanRE, opts.replaceRE));
}
  // Emoticons -> Emoji mapping.

  // (!) Some patterns skipped, to avoid collisions
  // without increase matcher complicity. Than can change in future.

  // Places to look for more emoticons info:

  // - http://en.wikipedia.org/wiki/List_of_emoticons#Western
  // - https://github.com/wooorm/emoticon/blob/master/Support.md
  // - http://factoryjoe.com/projects/emoticons/

  /* eslint-disable key-spacing */  var emojies_shortcuts = {
    angry: [">:(", ">:-("],
    blush: [':")', ':-")'],
    broken_heart: ["</3", "<\\3"],
    // :\ and :-\ not used because of conflict with markdown escaping
    confused: [":/", ":-/"],
    // twemoji shows question
    cry: [":'(", ":'-(", ":,(", ":,-("],
    frowning: [":(", ":-("],
    heart: ["<3"],
    imp: ["]:(", "]:-("],
    innocent: ["o:)", "O:)", "o:-)", "O:-)", "0:)", "0:-)"],
    joy: [":')", ":'-)", ":,)", ":,-)", ":'D", ":'-D", ":,D", ":,-D"],
    kissing: [":*", ":-*"],
    laughing: ["x-)", "X-)"],
    neutral_face: [":|", ":-|"],
    open_mouth: [":o", ":-o", ":O", ":-O"],
    rage: [":@", ":-@"],
    smile: [":D", ":-D"],
    smiley: [":)", ":-)"],
    smiling_imp: ["]:)", "]:-)"],
    sob: [":,'(", ":,'-(", ";(", ";-("],
    stuck_out_tongue: [":P", ":-P"],
    sunglasses: ["8-)", "B-)"],
    sweat: [",:(", ",:-("],
    sweat_smile: [",:)", ",:-)"],
    unamused: [":s", ":-S", ":z", ":-Z", ":$", ":-$"],
    wink: [";)", ";-)"]
};
// Generated, don't edit
var emojies_defs = {
    100: "\ud83d\udcaf",
    1234: "\ud83d\udd22",
    grinning: "\ud83d\ude00",
    smiley: "\ud83d\ude03",
    smile: "\ud83d\ude04",
    grin: "\ud83d\ude01",
    laughing: "\ud83d\ude06",
    satisfied: "\ud83d\ude06",
    sweat_smile: "\ud83d\ude05",
    rofl: "\ud83e\udd23",
    joy: "\ud83d\ude02",
    slightly_smiling_face: "\ud83d\ude42",
    upside_down_face: "\ud83d\ude43",
    melting_face: "\ud83e\udee0",
    wink: "\ud83d\ude09",
    blush: "\ud83d\ude0a",
    innocent: "\ud83d\ude07",
    smiling_face_with_three_hearts: "\ud83e\udd70",
    heart_eyes: "\ud83d\ude0d",
    star_struck: "\ud83e\udd29",
    kissing_heart: "\ud83d\ude18",
    kissing: "\ud83d\ude17",
    relaxed: "\u263a\ufe0f",
    kissing_closed_eyes: "\ud83d\ude1a",
    kissing_smiling_eyes: "\ud83d\ude19",
    smiling_face_with_tear: "\ud83e\udd72",
    yum: "\ud83d\ude0b",
    stuck_out_tongue: "\ud83d\ude1b",
    stuck_out_tongue_winking_eye: "\ud83d\ude1c",
    zany_face: "\ud83e\udd2a",
    stuck_out_tongue_closed_eyes: "\ud83d\ude1d",
    money_mouth_face: "\ud83e\udd11",
    hugs: "\ud83e\udd17",
    hand_over_mouth: "\ud83e\udd2d",
    face_with_open_eyes_and_hand_over_mouth: "\ud83e\udee2",
    face_with_peeking_eye: "\ud83e\udee3",
    shushing_face: "\ud83e\udd2b",
    thinking: "\ud83e\udd14",
    saluting_face: "\ud83e\udee1",
    zipper_mouth_face: "\ud83e\udd10",
    raised_eyebrow: "\ud83e\udd28",
    neutral_face: "\ud83d\ude10",
    expressionless: "\ud83d\ude11",
    no_mouth: "\ud83d\ude36",
    dotted_line_face: "\ud83e\udee5",
    face_in_clouds: "\ud83d\ude36\u200d\ud83c\udf2b\ufe0f",
    smirk: "\ud83d\ude0f",
    unamused: "\ud83d\ude12",
    roll_eyes: "\ud83d\ude44",
    grimacing: "\ud83d\ude2c",
    face_exhaling: "\ud83d\ude2e\u200d\ud83d\udca8",
    lying_face: "\ud83e\udd25",
    shaking_face: "\ud83e\udee8",
    relieved: "\ud83d\ude0c",
    pensive: "\ud83d\ude14",
    sleepy: "\ud83d\ude2a",
    drooling_face: "\ud83e\udd24",
    sleeping: "\ud83d\ude34",
    mask: "\ud83d\ude37",
    face_with_thermometer: "\ud83e\udd12",
    face_with_head_bandage: "\ud83e\udd15",
    nauseated_face: "\ud83e\udd22",
    vomiting_face: "\ud83e\udd2e",
    sneezing_face: "\ud83e\udd27",
    hot_face: "\ud83e\udd75",
    cold_face: "\ud83e\udd76",
    woozy_face: "\ud83e\udd74",
    dizzy_face: "\ud83d\ude35",
    face_with_spiral_eyes: "\ud83d\ude35\u200d\ud83d\udcab",
    exploding_head: "\ud83e\udd2f",
    cowboy_hat_face: "\ud83e\udd20",
    partying_face: "\ud83e\udd73",
    disguised_face: "\ud83e\udd78",
    sunglasses: "\ud83d\ude0e",
    nerd_face: "\ud83e\udd13",
    monocle_face: "\ud83e\uddd0",
    confused: "\ud83d\ude15",
    face_with_diagonal_mouth: "\ud83e\udee4",
    worried: "\ud83d\ude1f",
    slightly_frowning_face: "\ud83d\ude41",
    frowning_face: "\u2639\ufe0f",
    open_mouth: "\ud83d\ude2e",
    hushed: "\ud83d\ude2f",
    astonished: "\ud83d\ude32",
    flushed: "\ud83d\ude33",
    pleading_face: "\ud83e\udd7a",
    face_holding_back_tears: "\ud83e\udd79",
    frowning: "\ud83d\ude26",
    anguished: "\ud83d\ude27",
    fearful: "\ud83d\ude28",
    cold_sweat: "\ud83d\ude30",
    disappointed_relieved: "\ud83d\ude25",
    cry: "\ud83d\ude22",
    sob: "\ud83d\ude2d",
    scream: "\ud83d\ude31",
    confounded: "\ud83d\ude16",
    persevere: "\ud83d\ude23",
    disappointed: "\ud83d\ude1e",
    sweat: "\ud83d\ude13",
    weary: "\ud83d\ude29",
    tired_face: "\ud83d\ude2b",
    yawning_face: "\ud83e\udd71",
    triumph: "\ud83d\ude24",
    rage: "\ud83d\ude21",
    pout: "\ud83d\ude21",
    angry: "\ud83d\ude20",
    cursing_face: "\ud83e\udd2c",
    smiling_imp: "\ud83d\ude08",
    imp: "\ud83d\udc7f",
    skull: "\ud83d\udc80",
    skull_and_crossbones: "\u2620\ufe0f",
    hankey: "\ud83d\udca9",
    poop: "\ud83d\udca9",
    shit: "\ud83d\udca9",
    clown_face: "\ud83e\udd21",
    japanese_ogre: "\ud83d\udc79",
    japanese_goblin: "\ud83d\udc7a",
    ghost: "\ud83d\udc7b",
    alien: "\ud83d\udc7d",
    space_invader: "\ud83d\udc7e",
    robot: "\ud83e\udd16",
    smiley_cat: "\ud83d\ude3a",
    smile_cat: "\ud83d\ude38",
    joy_cat: "\ud83d\ude39",
    heart_eyes_cat: "\ud83d\ude3b",
    smirk_cat: "\ud83d\ude3c",
    kissing_cat: "\ud83d\ude3d",
    scream_cat: "\ud83d\ude40",
    crying_cat_face: "\ud83d\ude3f",
    pouting_cat: "\ud83d\ude3e",
    see_no_evil: "\ud83d\ude48",
    hear_no_evil: "\ud83d\ude49",
    speak_no_evil: "\ud83d\ude4a",
    love_letter: "\ud83d\udc8c",
    cupid: "\ud83d\udc98",
    gift_heart: "\ud83d\udc9d",
    sparkling_heart: "\ud83d\udc96",
    heartpulse: "\ud83d\udc97",
    heartbeat: "\ud83d\udc93",
    revolving_hearts: "\ud83d\udc9e",
    two_hearts: "\ud83d\udc95",
    heart_decoration: "\ud83d\udc9f",
    heavy_heart_exclamation: "\u2763\ufe0f",
    broken_heart: "\ud83d\udc94",
    heart_on_fire: "\u2764\ufe0f\u200d\ud83d\udd25",
    mending_heart: "\u2764\ufe0f\u200d\ud83e\ude79",
    heart: "\u2764\ufe0f",
    pink_heart: "\ud83e\ude77",
    orange_heart: "\ud83e\udde1",
    yellow_heart: "\ud83d\udc9b",
    green_heart: "\ud83d\udc9a",
    blue_heart: "\ud83d\udc99",
    light_blue_heart: "\ud83e\ude75",
    purple_heart: "\ud83d\udc9c",
    brown_heart: "\ud83e\udd0e",
    black_heart: "\ud83d\udda4",
    grey_heart: "\ud83e\ude76",
    white_heart: "\ud83e\udd0d",
    kiss: "\ud83d\udc8b",
    anger: "\ud83d\udca2",
    boom: "\ud83d\udca5",
    collision: "\ud83d\udca5",
    dizzy: "\ud83d\udcab",
    sweat_drops: "\ud83d\udca6",
    dash: "\ud83d\udca8",
    hole: "\ud83d\udd73\ufe0f",
    speech_balloon: "\ud83d\udcac",
    eye_speech_bubble: "\ud83d\udc41\ufe0f\u200d\ud83d\udde8\ufe0f",
    left_speech_bubble: "\ud83d\udde8\ufe0f",
    right_anger_bubble: "\ud83d\uddef\ufe0f",
    thought_balloon: "\ud83d\udcad",
    zzz: "\ud83d\udca4",
    wave: "\ud83d\udc4b",
    raised_back_of_hand: "\ud83e\udd1a",
    raised_hand_with_fingers_splayed: "\ud83d\udd90\ufe0f",
    hand: "\u270b",
    raised_hand: "\u270b",
    vulcan_salute: "\ud83d\udd96",
    rightwards_hand: "\ud83e\udef1",
    leftwards_hand: "\ud83e\udef2",
    palm_down_hand: "\ud83e\udef3",
    palm_up_hand: "\ud83e\udef4",
    leftwards_pushing_hand: "\ud83e\udef7",
    rightwards_pushing_hand: "\ud83e\udef8",
    ok_hand: "\ud83d\udc4c",
    pinched_fingers: "\ud83e\udd0c",
    pinching_hand: "\ud83e\udd0f",
    v: "\u270c\ufe0f",
    crossed_fingers: "\ud83e\udd1e",
    hand_with_index_finger_and_thumb_crossed: "\ud83e\udef0",
    love_you_gesture: "\ud83e\udd1f",
    metal: "\ud83e\udd18",
    call_me_hand: "\ud83e\udd19",
    point_left: "\ud83d\udc48",
    point_right: "\ud83d\udc49",
    point_up_2: "\ud83d\udc46",
    middle_finger: "\ud83d\udd95",
    fu: "\ud83d\udd95",
    point_down: "\ud83d\udc47",
    point_up: "\u261d\ufe0f",
    index_pointing_at_the_viewer: "\ud83e\udef5",
    "+1": "\ud83d\udc4d",
    thumbsup: "\ud83d\udc4d",
    "-1": "\ud83d\udc4e",
    thumbsdown: "\ud83d\udc4e",
    fist_raised: "\u270a",
    fist: "\u270a",
    fist_oncoming: "\ud83d\udc4a",
    facepunch: "\ud83d\udc4a",
    punch: "\ud83d\udc4a",
    fist_left: "\ud83e\udd1b",
    fist_right: "\ud83e\udd1c",
    clap: "\ud83d\udc4f",
    raised_hands: "\ud83d\ude4c",
    heart_hands: "\ud83e\udef6",
    open_hands: "\ud83d\udc50",
    palms_up_together: "\ud83e\udd32",
    handshake: "\ud83e\udd1d",
    pray: "\ud83d\ude4f",
    writing_hand: "\u270d\ufe0f",
    nail_care: "\ud83d\udc85",
    selfie: "\ud83e\udd33",
    muscle: "\ud83d\udcaa",
    mechanical_arm: "\ud83e\uddbe",
    mechanical_leg: "\ud83e\uddbf",
    leg: "\ud83e\uddb5",
    foot: "\ud83e\uddb6",
    ear: "\ud83d\udc42",
    ear_with_hearing_aid: "\ud83e\uddbb",
    nose: "\ud83d\udc43",
    brain: "\ud83e\udde0",
    anatomical_heart: "\ud83e\udec0",
    lungs: "\ud83e\udec1",
    tooth: "\ud83e\uddb7",
    bone: "\ud83e\uddb4",
    eyes: "\ud83d\udc40",
    eye: "\ud83d\udc41\ufe0f",
    tongue: "\ud83d\udc45",
    lips: "\ud83d\udc44",
    biting_lip: "\ud83e\udee6",
    baby: "\ud83d\udc76",
    child: "\ud83e\uddd2",
    boy: "\ud83d\udc66",
    girl: "\ud83d\udc67",
    adult: "\ud83e\uddd1",
    blond_haired_person: "\ud83d\udc71",
    man: "\ud83d\udc68",
    bearded_person: "\ud83e\uddd4",
    man_beard: "\ud83e\uddd4\u200d\u2642\ufe0f",
    woman_beard: "\ud83e\uddd4\u200d\u2640\ufe0f",
    red_haired_man: "\ud83d\udc68\u200d\ud83e\uddb0",
    curly_haired_man: "\ud83d\udc68\u200d\ud83e\uddb1",
    white_haired_man: "\ud83d\udc68\u200d\ud83e\uddb3",
    bald_man: "\ud83d\udc68\u200d\ud83e\uddb2",
    woman: "\ud83d\udc69",
    red_haired_woman: "\ud83d\udc69\u200d\ud83e\uddb0",
    person_red_hair: "\ud83e\uddd1\u200d\ud83e\uddb0",
    curly_haired_woman: "\ud83d\udc69\u200d\ud83e\uddb1",
    person_curly_hair: "\ud83e\uddd1\u200d\ud83e\uddb1",
    white_haired_woman: "\ud83d\udc69\u200d\ud83e\uddb3",
    person_white_hair: "\ud83e\uddd1\u200d\ud83e\uddb3",
    bald_woman: "\ud83d\udc69\u200d\ud83e\uddb2",
    person_bald: "\ud83e\uddd1\u200d\ud83e\uddb2",
    blond_haired_woman: "\ud83d\udc71\u200d\u2640\ufe0f",
    blonde_woman: "\ud83d\udc71\u200d\u2640\ufe0f",
    blond_haired_man: "\ud83d\udc71\u200d\u2642\ufe0f",
    older_adult: "\ud83e\uddd3",
    older_man: "\ud83d\udc74",
    older_woman: "\ud83d\udc75",
    frowning_person: "\ud83d\ude4d",
    frowning_man: "\ud83d\ude4d\u200d\u2642\ufe0f",
    frowning_woman: "\ud83d\ude4d\u200d\u2640\ufe0f",
    pouting_face: "\ud83d\ude4e",
    pouting_man: "\ud83d\ude4e\u200d\u2642\ufe0f",
    pouting_woman: "\ud83d\ude4e\u200d\u2640\ufe0f",
    no_good: "\ud83d\ude45",
    no_good_man: "\ud83d\ude45\u200d\u2642\ufe0f",
    ng_man: "\ud83d\ude45\u200d\u2642\ufe0f",
    no_good_woman: "\ud83d\ude45\u200d\u2640\ufe0f",
    ng_woman: "\ud83d\ude45\u200d\u2640\ufe0f",
    ok_person: "\ud83d\ude46",
    ok_man: "\ud83d\ude46\u200d\u2642\ufe0f",
    ok_woman: "\ud83d\ude46\u200d\u2640\ufe0f",
    tipping_hand_person: "\ud83d\udc81",
    information_desk_person: "\ud83d\udc81",
    tipping_hand_man: "\ud83d\udc81\u200d\u2642\ufe0f",
    sassy_man: "\ud83d\udc81\u200d\u2642\ufe0f",
    tipping_hand_woman: "\ud83d\udc81\u200d\u2640\ufe0f",
    sassy_woman: "\ud83d\udc81\u200d\u2640\ufe0f",
    raising_hand: "\ud83d\ude4b",
    raising_hand_man: "\ud83d\ude4b\u200d\u2642\ufe0f",
    raising_hand_woman: "\ud83d\ude4b\u200d\u2640\ufe0f",
    deaf_person: "\ud83e\uddcf",
    deaf_man: "\ud83e\uddcf\u200d\u2642\ufe0f",
    deaf_woman: "\ud83e\uddcf\u200d\u2640\ufe0f",
    bow: "\ud83d\ude47",
    bowing_man: "\ud83d\ude47\u200d\u2642\ufe0f",
    bowing_woman: "\ud83d\ude47\u200d\u2640\ufe0f",
    facepalm: "\ud83e\udd26",
    man_facepalming: "\ud83e\udd26\u200d\u2642\ufe0f",
    woman_facepalming: "\ud83e\udd26\u200d\u2640\ufe0f",
    shrug: "\ud83e\udd37",
    man_shrugging: "\ud83e\udd37\u200d\u2642\ufe0f",
    woman_shrugging: "\ud83e\udd37\u200d\u2640\ufe0f",
    health_worker: "\ud83e\uddd1\u200d\u2695\ufe0f",
    man_health_worker: "\ud83d\udc68\u200d\u2695\ufe0f",
    woman_health_worker: "\ud83d\udc69\u200d\u2695\ufe0f",
    student: "\ud83e\uddd1\u200d\ud83c\udf93",
    man_student: "\ud83d\udc68\u200d\ud83c\udf93",
    woman_student: "\ud83d\udc69\u200d\ud83c\udf93",
    teacher: "\ud83e\uddd1\u200d\ud83c\udfeb",
    man_teacher: "\ud83d\udc68\u200d\ud83c\udfeb",
    woman_teacher: "\ud83d\udc69\u200d\ud83c\udfeb",
    judge: "\ud83e\uddd1\u200d\u2696\ufe0f",
    man_judge: "\ud83d\udc68\u200d\u2696\ufe0f",
    woman_judge: "\ud83d\udc69\u200d\u2696\ufe0f",
    farmer: "\ud83e\uddd1\u200d\ud83c\udf3e",
    man_farmer: "\ud83d\udc68\u200d\ud83c\udf3e",
    woman_farmer: "\ud83d\udc69\u200d\ud83c\udf3e",
    cook: "\ud83e\uddd1\u200d\ud83c\udf73",
    man_cook: "\ud83d\udc68\u200d\ud83c\udf73",
    woman_cook: "\ud83d\udc69\u200d\ud83c\udf73",
    mechanic: "\ud83e\uddd1\u200d\ud83d\udd27",
    man_mechanic: "\ud83d\udc68\u200d\ud83d\udd27",
    woman_mechanic: "\ud83d\udc69\u200d\ud83d\udd27",
    factory_worker: "\ud83e\uddd1\u200d\ud83c\udfed",
    man_factory_worker: "\ud83d\udc68\u200d\ud83c\udfed",
    woman_factory_worker: "\ud83d\udc69\u200d\ud83c\udfed",
    office_worker: "\ud83e\uddd1\u200d\ud83d\udcbc",
    man_office_worker: "\ud83d\udc68\u200d\ud83d\udcbc",
    woman_office_worker: "\ud83d\udc69\u200d\ud83d\udcbc",
    scientist: "\ud83e\uddd1\u200d\ud83d\udd2c",
    man_scientist: "\ud83d\udc68\u200d\ud83d\udd2c",
    woman_scientist: "\ud83d\udc69\u200d\ud83d\udd2c",
    technologist: "\ud83e\uddd1\u200d\ud83d\udcbb",
    man_technologist: "\ud83d\udc68\u200d\ud83d\udcbb",
    woman_technologist: "\ud83d\udc69\u200d\ud83d\udcbb",
    singer: "\ud83e\uddd1\u200d\ud83c\udfa4",
    man_singer: "\ud83d\udc68\u200d\ud83c\udfa4",
    woman_singer: "\ud83d\udc69\u200d\ud83c\udfa4",
    artist: "\ud83e\uddd1\u200d\ud83c\udfa8",
    man_artist: "\ud83d\udc68\u200d\ud83c\udfa8",
    woman_artist: "\ud83d\udc69\u200d\ud83c\udfa8",
    pilot: "\ud83e\uddd1\u200d\u2708\ufe0f",
    man_pilot: "\ud83d\udc68\u200d\u2708\ufe0f",
    woman_pilot: "\ud83d\udc69\u200d\u2708\ufe0f",
    astronaut: "\ud83e\uddd1\u200d\ud83d\ude80",
    man_astronaut: "\ud83d\udc68\u200d\ud83d\ude80",
    woman_astronaut: "\ud83d\udc69\u200d\ud83d\ude80",
    firefighter: "\ud83e\uddd1\u200d\ud83d\ude92",
    man_firefighter: "\ud83d\udc68\u200d\ud83d\ude92",
    woman_firefighter: "\ud83d\udc69\u200d\ud83d\ude92",
    police_officer: "\ud83d\udc6e",
    cop: "\ud83d\udc6e",
    policeman: "\ud83d\udc6e\u200d\u2642\ufe0f",
    policewoman: "\ud83d\udc6e\u200d\u2640\ufe0f",
    detective: "\ud83d\udd75\ufe0f",
    male_detective: "\ud83d\udd75\ufe0f\u200d\u2642\ufe0f",
    female_detective: "\ud83d\udd75\ufe0f\u200d\u2640\ufe0f",
    guard: "\ud83d\udc82",
    guardsman: "\ud83d\udc82\u200d\u2642\ufe0f",
    guardswoman: "\ud83d\udc82\u200d\u2640\ufe0f",
    ninja: "\ud83e\udd77",
    construction_worker: "\ud83d\udc77",
    construction_worker_man: "\ud83d\udc77\u200d\u2642\ufe0f",
    construction_worker_woman: "\ud83d\udc77\u200d\u2640\ufe0f",
    person_with_crown: "\ud83e\udec5",
    prince: "\ud83e\udd34",
    princess: "\ud83d\udc78",
    person_with_turban: "\ud83d\udc73",
    man_with_turban: "\ud83d\udc73\u200d\u2642\ufe0f",
    woman_with_turban: "\ud83d\udc73\u200d\u2640\ufe0f",
    man_with_gua_pi_mao: "\ud83d\udc72",
    woman_with_headscarf: "\ud83e\uddd5",
    person_in_tuxedo: "\ud83e\udd35",
    man_in_tuxedo: "\ud83e\udd35\u200d\u2642\ufe0f",
    woman_in_tuxedo: "\ud83e\udd35\u200d\u2640\ufe0f",
    person_with_veil: "\ud83d\udc70",
    man_with_veil: "\ud83d\udc70\u200d\u2642\ufe0f",
    woman_with_veil: "\ud83d\udc70\u200d\u2640\ufe0f",
    bride_with_veil: "\ud83d\udc70\u200d\u2640\ufe0f",
    pregnant_woman: "\ud83e\udd30",
    pregnant_man: "\ud83e\udec3",
    pregnant_person: "\ud83e\udec4",
    breast_feeding: "\ud83e\udd31",
    woman_feeding_baby: "\ud83d\udc69\u200d\ud83c\udf7c",
    man_feeding_baby: "\ud83d\udc68\u200d\ud83c\udf7c",
    person_feeding_baby: "\ud83e\uddd1\u200d\ud83c\udf7c",
    angel: "\ud83d\udc7c",
    santa: "\ud83c\udf85",
    mrs_claus: "\ud83e\udd36",
    mx_claus: "\ud83e\uddd1\u200d\ud83c\udf84",
    superhero: "\ud83e\uddb8",
    superhero_man: "\ud83e\uddb8\u200d\u2642\ufe0f",
    superhero_woman: "\ud83e\uddb8\u200d\u2640\ufe0f",
    supervillain: "\ud83e\uddb9",
    supervillain_man: "\ud83e\uddb9\u200d\u2642\ufe0f",
    supervillain_woman: "\ud83e\uddb9\u200d\u2640\ufe0f",
    mage: "\ud83e\uddd9",
    mage_man: "\ud83e\uddd9\u200d\u2642\ufe0f",
    mage_woman: "\ud83e\uddd9\u200d\u2640\ufe0f",
    fairy: "\ud83e\uddda",
    fairy_man: "\ud83e\uddda\u200d\u2642\ufe0f",
    fairy_woman: "\ud83e\uddda\u200d\u2640\ufe0f",
    vampire: "\ud83e\udddb",
    vampire_man: "\ud83e\udddb\u200d\u2642\ufe0f",
    vampire_woman: "\ud83e\udddb\u200d\u2640\ufe0f",
    merperson: "\ud83e\udddc",
    merman: "\ud83e\udddc\u200d\u2642\ufe0f",
    mermaid: "\ud83e\udddc\u200d\u2640\ufe0f",
    elf: "\ud83e\udddd",
    elf_man: "\ud83e\udddd\u200d\u2642\ufe0f",
    elf_woman: "\ud83e\udddd\u200d\u2640\ufe0f",
    genie: "\ud83e\uddde",
    genie_man: "\ud83e\uddde\u200d\u2642\ufe0f",
    genie_woman: "\ud83e\uddde\u200d\u2640\ufe0f",
    zombie: "\ud83e\udddf",
    zombie_man: "\ud83e\udddf\u200d\u2642\ufe0f",
    zombie_woman: "\ud83e\udddf\u200d\u2640\ufe0f",
    troll: "\ud83e\uddcc",
    massage: "\ud83d\udc86",
    massage_man: "\ud83d\udc86\u200d\u2642\ufe0f",
    massage_woman: "\ud83d\udc86\u200d\u2640\ufe0f",
    haircut: "\ud83d\udc87",
    haircut_man: "\ud83d\udc87\u200d\u2642\ufe0f",
    haircut_woman: "\ud83d\udc87\u200d\u2640\ufe0f",
    walking: "\ud83d\udeb6",
    walking_man: "\ud83d\udeb6\u200d\u2642\ufe0f",
    walking_woman: "\ud83d\udeb6\u200d\u2640\ufe0f",
    standing_person: "\ud83e\uddcd",
    standing_man: "\ud83e\uddcd\u200d\u2642\ufe0f",
    standing_woman: "\ud83e\uddcd\u200d\u2640\ufe0f",
    kneeling_person: "\ud83e\uddce",
    kneeling_man: "\ud83e\uddce\u200d\u2642\ufe0f",
    kneeling_woman: "\ud83e\uddce\u200d\u2640\ufe0f",
    person_with_probing_cane: "\ud83e\uddd1\u200d\ud83e\uddaf",
    man_with_probing_cane: "\ud83d\udc68\u200d\ud83e\uddaf",
    woman_with_probing_cane: "\ud83d\udc69\u200d\ud83e\uddaf",
    person_in_motorized_wheelchair: "\ud83e\uddd1\u200d\ud83e\uddbc",
    man_in_motorized_wheelchair: "\ud83d\udc68\u200d\ud83e\uddbc",
    woman_in_motorized_wheelchair: "\ud83d\udc69\u200d\ud83e\uddbc",
    person_in_manual_wheelchair: "\ud83e\uddd1\u200d\ud83e\uddbd",
    man_in_manual_wheelchair: "\ud83d\udc68\u200d\ud83e\uddbd",
    woman_in_manual_wheelchair: "\ud83d\udc69\u200d\ud83e\uddbd",
    runner: "\ud83c\udfc3",
    running: "\ud83c\udfc3",
    running_man: "\ud83c\udfc3\u200d\u2642\ufe0f",
    running_woman: "\ud83c\udfc3\u200d\u2640\ufe0f",
    woman_dancing: "\ud83d\udc83",
    dancer: "\ud83d\udc83",
    man_dancing: "\ud83d\udd7a",
    business_suit_levitating: "\ud83d\udd74\ufe0f",
    dancers: "\ud83d\udc6f",
    dancing_men: "\ud83d\udc6f\u200d\u2642\ufe0f",
    dancing_women: "\ud83d\udc6f\u200d\u2640\ufe0f",
    sauna_person: "\ud83e\uddd6",
    sauna_man: "\ud83e\uddd6\u200d\u2642\ufe0f",
    sauna_woman: "\ud83e\uddd6\u200d\u2640\ufe0f",
    climbing: "\ud83e\uddd7",
    climbing_man: "\ud83e\uddd7\u200d\u2642\ufe0f",
    climbing_woman: "\ud83e\uddd7\u200d\u2640\ufe0f",
    person_fencing: "\ud83e\udd3a",
    horse_racing: "\ud83c\udfc7",
    skier: "\u26f7\ufe0f",
    snowboarder: "\ud83c\udfc2",
    golfing: "\ud83c\udfcc\ufe0f",
    golfing_man: "\ud83c\udfcc\ufe0f\u200d\u2642\ufe0f",
    golfing_woman: "\ud83c\udfcc\ufe0f\u200d\u2640\ufe0f",
    surfer: "\ud83c\udfc4",
    surfing_man: "\ud83c\udfc4\u200d\u2642\ufe0f",
    surfing_woman: "\ud83c\udfc4\u200d\u2640\ufe0f",
    rowboat: "\ud83d\udea3",
    rowing_man: "\ud83d\udea3\u200d\u2642\ufe0f",
    rowing_woman: "\ud83d\udea3\u200d\u2640\ufe0f",
    swimmer: "\ud83c\udfca",
    swimming_man: "\ud83c\udfca\u200d\u2642\ufe0f",
    swimming_woman: "\ud83c\udfca\u200d\u2640\ufe0f",
    bouncing_ball_person: "\u26f9\ufe0f",
    bouncing_ball_man: "\u26f9\ufe0f\u200d\u2642\ufe0f",
    basketball_man: "\u26f9\ufe0f\u200d\u2642\ufe0f",
    bouncing_ball_woman: "\u26f9\ufe0f\u200d\u2640\ufe0f",
    basketball_woman: "\u26f9\ufe0f\u200d\u2640\ufe0f",
    weight_lifting: "\ud83c\udfcb\ufe0f",
    weight_lifting_man: "\ud83c\udfcb\ufe0f\u200d\u2642\ufe0f",
    weight_lifting_woman: "\ud83c\udfcb\ufe0f\u200d\u2640\ufe0f",
    bicyclist: "\ud83d\udeb4",
    biking_man: "\ud83d\udeb4\u200d\u2642\ufe0f",
    biking_woman: "\ud83d\udeb4\u200d\u2640\ufe0f",
    mountain_bicyclist: "\ud83d\udeb5",
    mountain_biking_man: "\ud83d\udeb5\u200d\u2642\ufe0f",
    mountain_biking_woman: "\ud83d\udeb5\u200d\u2640\ufe0f",
    cartwheeling: "\ud83e\udd38",
    man_cartwheeling: "\ud83e\udd38\u200d\u2642\ufe0f",
    woman_cartwheeling: "\ud83e\udd38\u200d\u2640\ufe0f",
    wrestling: "\ud83e\udd3c",
    men_wrestling: "\ud83e\udd3c\u200d\u2642\ufe0f",
    women_wrestling: "\ud83e\udd3c\u200d\u2640\ufe0f",
    water_polo: "\ud83e\udd3d",
    man_playing_water_polo: "\ud83e\udd3d\u200d\u2642\ufe0f",
    woman_playing_water_polo: "\ud83e\udd3d\u200d\u2640\ufe0f",
    handball_person: "\ud83e\udd3e",
    man_playing_handball: "\ud83e\udd3e\u200d\u2642\ufe0f",
    woman_playing_handball: "\ud83e\udd3e\u200d\u2640\ufe0f",
    juggling_person: "\ud83e\udd39",
    man_juggling: "\ud83e\udd39\u200d\u2642\ufe0f",
    woman_juggling: "\ud83e\udd39\u200d\u2640\ufe0f",
    lotus_position: "\ud83e\uddd8",
    lotus_position_man: "\ud83e\uddd8\u200d\u2642\ufe0f",
    lotus_position_woman: "\ud83e\uddd8\u200d\u2640\ufe0f",
    bath: "\ud83d\udec0",
    sleeping_bed: "\ud83d\udecc",
    people_holding_hands: "\ud83e\uddd1\u200d\ud83e\udd1d\u200d\ud83e\uddd1",
    two_women_holding_hands: "\ud83d\udc6d",
    couple: "\ud83d\udc6b",
    two_men_holding_hands: "\ud83d\udc6c",
    couplekiss: "\ud83d\udc8f",
    couplekiss_man_woman: "\ud83d\udc69\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68",
    couplekiss_man_man: "\ud83d\udc68\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68",
    couplekiss_woman_woman: "\ud83d\udc69\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69",
    couple_with_heart: "\ud83d\udc91",
    couple_with_heart_woman_man: "\ud83d\udc69\u200d\u2764\ufe0f\u200d\ud83d\udc68",
    couple_with_heart_man_man: "\ud83d\udc68\u200d\u2764\ufe0f\u200d\ud83d\udc68",
    couple_with_heart_woman_woman: "\ud83d\udc69\u200d\u2764\ufe0f\u200d\ud83d\udc69",
    family: "\ud83d\udc6a",
    family_man_woman_boy: "\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc66",
    family_man_woman_girl: "\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67",
    family_man_woman_girl_boy: "\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d\udc66",
    family_man_woman_boy_boy: "\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc66\u200d\ud83d\udc66",
    family_man_woman_girl_girl: "\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d\udc67",
    family_man_man_boy: "\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d\udc66",
    family_man_man_girl: "\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d\udc67",
    family_man_man_girl_boy: "\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d\udc67\u200d\ud83d\udc66",
    family_man_man_boy_boy: "\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d\udc66\u200d\ud83d\udc66",
    family_man_man_girl_girl: "\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d\udc67\u200d\ud83d\udc67",
    family_woman_woman_boy: "\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d\udc66",
    family_woman_woman_girl: "\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d\udc67",
    family_woman_woman_girl_boy: "\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d\udc66",
    family_woman_woman_boy_boy: "\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d\udc66\u200d\ud83d\udc66",
    family_woman_woman_girl_girl: "\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d\udc67",
    family_man_boy: "\ud83d\udc68\u200d\ud83d\udc66",
    family_man_boy_boy: "\ud83d\udc68\u200d\ud83d\udc66\u200d\ud83d\udc66",
    family_man_girl: "\ud83d\udc68\u200d\ud83d\udc67",
    family_man_girl_boy: "\ud83d\udc68\u200d\ud83d\udc67\u200d\ud83d\udc66",
    family_man_girl_girl: "\ud83d\udc68\u200d\ud83d\udc67\u200d\ud83d\udc67",
    family_woman_boy: "\ud83d\udc69\u200d\ud83d\udc66",
    family_woman_boy_boy: "\ud83d\udc69\u200d\ud83d\udc66\u200d\ud83d\udc66",
    family_woman_girl: "\ud83d\udc69\u200d\ud83d\udc67",
    family_woman_girl_boy: "\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d\udc66",
    family_woman_girl_girl: "\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d\udc67",
    speaking_head: "\ud83d\udde3\ufe0f",
    bust_in_silhouette: "\ud83d\udc64",
    busts_in_silhouette: "\ud83d\udc65",
    people_hugging: "\ud83e\udec2",
    footprints: "\ud83d\udc63",
    monkey_face: "\ud83d\udc35",
    monkey: "\ud83d\udc12",
    gorilla: "\ud83e\udd8d",
    orangutan: "\ud83e\udda7",
    dog: "\ud83d\udc36",
    dog2: "\ud83d\udc15",
    guide_dog: "\ud83e\uddae",
    service_dog: "\ud83d\udc15\u200d\ud83e\uddba",
    poodle: "\ud83d\udc29",
    wolf: "\ud83d\udc3a",
    fox_face: "\ud83e\udd8a",
    raccoon: "\ud83e\udd9d",
    cat: "\ud83d\udc31",
    cat2: "\ud83d\udc08",
    black_cat: "\ud83d\udc08\u200d\u2b1b",
    lion: "\ud83e\udd81",
    tiger: "\ud83d\udc2f",
    tiger2: "\ud83d\udc05",
    leopard: "\ud83d\udc06",
    horse: "\ud83d\udc34",
    moose: "\ud83e\udece",
    donkey: "\ud83e\udecf",
    racehorse: "\ud83d\udc0e",
    unicorn: "\ud83e\udd84",
    zebra: "\ud83e\udd93",
    deer: "\ud83e\udd8c",
    bison: "\ud83e\uddac",
    cow: "\ud83d\udc2e",
    ox: "\ud83d\udc02",
    water_buffalo: "\ud83d\udc03",
    cow2: "\ud83d\udc04",
    pig: "\ud83d\udc37",
    pig2: "\ud83d\udc16",
    boar: "\ud83d\udc17",
    pig_nose: "\ud83d\udc3d",
    ram: "\ud83d\udc0f",
    sheep: "\ud83d\udc11",
    goat: "\ud83d\udc10",
    dromedary_camel: "\ud83d\udc2a",
    camel: "\ud83d\udc2b",
    llama: "\ud83e\udd99",
    giraffe: "\ud83e\udd92",
    elephant: "\ud83d\udc18",
    mammoth: "\ud83e\udda3",
    rhinoceros: "\ud83e\udd8f",
    hippopotamus: "\ud83e\udd9b",
    mouse: "\ud83d\udc2d",
    mouse2: "\ud83d\udc01",
    rat: "\ud83d\udc00",
    hamster: "\ud83d\udc39",
    rabbit: "\ud83d\udc30",
    rabbit2: "\ud83d\udc07",
    chipmunk: "\ud83d\udc3f\ufe0f",
    beaver: "\ud83e\uddab",
    hedgehog: "\ud83e\udd94",
    bat: "\ud83e\udd87",
    bear: "\ud83d\udc3b",
    polar_bear: "\ud83d\udc3b\u200d\u2744\ufe0f",
    koala: "\ud83d\udc28",
    panda_face: "\ud83d\udc3c",
    sloth: "\ud83e\udda5",
    otter: "\ud83e\udda6",
    skunk: "\ud83e\udda8",
    kangaroo: "\ud83e\udd98",
    badger: "\ud83e\udda1",
    feet: "\ud83d\udc3e",
    paw_prints: "\ud83d\udc3e",
    turkey: "\ud83e\udd83",
    chicken: "\ud83d\udc14",
    rooster: "\ud83d\udc13",
    hatching_chick: "\ud83d\udc23",
    baby_chick: "\ud83d\udc24",
    hatched_chick: "\ud83d\udc25",
    bird: "\ud83d\udc26",
    penguin: "\ud83d\udc27",
    dove: "\ud83d\udd4a\ufe0f",
    eagle: "\ud83e\udd85",
    duck: "\ud83e\udd86",
    swan: "\ud83e\udda2",
    owl: "\ud83e\udd89",
    dodo: "\ud83e\udda4",
    feather: "\ud83e\udeb6",
    flamingo: "\ud83e\udda9",
    peacock: "\ud83e\udd9a",
    parrot: "\ud83e\udd9c",
    wing: "\ud83e\udebd",
    black_bird: "\ud83d\udc26\u200d\u2b1b",
    goose: "\ud83e\udebf",
    frog: "\ud83d\udc38",
    crocodile: "\ud83d\udc0a",
    turtle: "\ud83d\udc22",
    lizard: "\ud83e\udd8e",
    snake: "\ud83d\udc0d",
    dragon_face: "\ud83d\udc32",
    dragon: "\ud83d\udc09",
    sauropod: "\ud83e\udd95",
    "t-rex": "\ud83e\udd96",
    whale: "\ud83d\udc33",
    whale2: "\ud83d\udc0b",
    dolphin: "\ud83d\udc2c",
    flipper: "\ud83d\udc2c",
    seal: "\ud83e\uddad",
    fish: "\ud83d\udc1f",
    tropical_fish: "\ud83d\udc20",
    blowfish: "\ud83d\udc21",
    shark: "\ud83e\udd88",
    octopus: "\ud83d\udc19",
    shell: "\ud83d\udc1a",
    coral: "\ud83e\udeb8",
    jellyfish: "\ud83e\udebc",
    snail: "\ud83d\udc0c",
    butterfly: "\ud83e\udd8b",
    bug: "\ud83d\udc1b",
    ant: "\ud83d\udc1c",
    bee: "\ud83d\udc1d",
    honeybee: "\ud83d\udc1d",
    beetle: "\ud83e\udeb2",
    lady_beetle: "\ud83d\udc1e",
    cricket: "\ud83e\udd97",
    cockroach: "\ud83e\udeb3",
    spider: "\ud83d\udd77\ufe0f",
    spider_web: "\ud83d\udd78\ufe0f",
    scorpion: "\ud83e\udd82",
    mosquito: "\ud83e\udd9f",
    fly: "\ud83e\udeb0",
    worm: "\ud83e\udeb1",
    microbe: "\ud83e\udda0",
    bouquet: "\ud83d\udc90",
    cherry_blossom: "\ud83c\udf38",
    white_flower: "\ud83d\udcae",
    lotus: "\ud83e\udeb7",
    rosette: "\ud83c\udff5\ufe0f",
    rose: "\ud83c\udf39",
    wilted_flower: "\ud83e\udd40",
    hibiscus: "\ud83c\udf3a",
    sunflower: "\ud83c\udf3b",
    blossom: "\ud83c\udf3c",
    tulip: "\ud83c\udf37",
    hyacinth: "\ud83e\udebb",
    seedling: "\ud83c\udf31",
    potted_plant: "\ud83e\udeb4",
    evergreen_tree: "\ud83c\udf32",
    deciduous_tree: "\ud83c\udf33",
    palm_tree: "\ud83c\udf34",
    cactus: "\ud83c\udf35",
    ear_of_rice: "\ud83c\udf3e",
    herb: "\ud83c\udf3f",
    shamrock: "\u2618\ufe0f",
    four_leaf_clover: "\ud83c\udf40",
    maple_leaf: "\ud83c\udf41",
    fallen_leaf: "\ud83c\udf42",
    leaves: "\ud83c\udf43",
    empty_nest: "\ud83e\udeb9",
    nest_with_eggs: "\ud83e\udeba",
    mushroom: "\ud83c\udf44",
    grapes: "\ud83c\udf47",
    melon: "\ud83c\udf48",
    watermelon: "\ud83c\udf49",
    tangerine: "\ud83c\udf4a",
    orange: "\ud83c\udf4a",
    mandarin: "\ud83c\udf4a",
    lemon: "\ud83c\udf4b",
    banana: "\ud83c\udf4c",
    pineapple: "\ud83c\udf4d",
    mango: "\ud83e\udd6d",
    apple: "\ud83c\udf4e",
    green_apple: "\ud83c\udf4f",
    pear: "\ud83c\udf50",
    peach: "\ud83c\udf51",
    cherries: "\ud83c\udf52",
    strawberry: "\ud83c\udf53",
    blueberries: "\ud83e\uded0",
    kiwi_fruit: "\ud83e\udd5d",
    tomato: "\ud83c\udf45",
    olive: "\ud83e\uded2",
    coconut: "\ud83e\udd65",
    avocado: "\ud83e\udd51",
    eggplant: "\ud83c\udf46",
    potato: "\ud83e\udd54",
    carrot: "\ud83e\udd55",
    corn: "\ud83c\udf3d",
    hot_pepper: "\ud83c\udf36\ufe0f",
    bell_pepper: "\ud83e\uded1",
    cucumber: "\ud83e\udd52",
    leafy_green: "\ud83e\udd6c",
    broccoli: "\ud83e\udd66",
    garlic: "\ud83e\uddc4",
    onion: "\ud83e\uddc5",
    peanuts: "\ud83e\udd5c",
    beans: "\ud83e\uded8",
    chestnut: "\ud83c\udf30",
    ginger_root: "\ud83e\udeda",
    pea_pod: "\ud83e\udedb",
    bread: "\ud83c\udf5e",
    croissant: "\ud83e\udd50",
    baguette_bread: "\ud83e\udd56",
    flatbread: "\ud83e\uded3",
    pretzel: "\ud83e\udd68",
    bagel: "\ud83e\udd6f",
    pancakes: "\ud83e\udd5e",
    waffle: "\ud83e\uddc7",
    cheese: "\ud83e\uddc0",
    meat_on_bone: "\ud83c\udf56",
    poultry_leg: "\ud83c\udf57",
    cut_of_meat: "\ud83e\udd69",
    bacon: "\ud83e\udd53",
    hamburger: "\ud83c\udf54",
    fries: "\ud83c\udf5f",
    pizza: "\ud83c\udf55",
    hotdog: "\ud83c\udf2d",
    sandwich: "\ud83e\udd6a",
    taco: "\ud83c\udf2e",
    burrito: "\ud83c\udf2f",
    tamale: "\ud83e\uded4",
    stuffed_flatbread: "\ud83e\udd59",
    falafel: "\ud83e\uddc6",
    egg: "\ud83e\udd5a",
    fried_egg: "\ud83c\udf73",
    shallow_pan_of_food: "\ud83e\udd58",
    stew: "\ud83c\udf72",
    fondue: "\ud83e\uded5",
    bowl_with_spoon: "\ud83e\udd63",
    green_salad: "\ud83e\udd57",
    popcorn: "\ud83c\udf7f",
    butter: "\ud83e\uddc8",
    salt: "\ud83e\uddc2",
    canned_food: "\ud83e\udd6b",
    bento: "\ud83c\udf71",
    rice_cracker: "\ud83c\udf58",
    rice_ball: "\ud83c\udf59",
    rice: "\ud83c\udf5a",
    curry: "\ud83c\udf5b",
    ramen: "\ud83c\udf5c",
    spaghetti: "\ud83c\udf5d",
    sweet_potato: "\ud83c\udf60",
    oden: "\ud83c\udf62",
    sushi: "\ud83c\udf63",
    fried_shrimp: "\ud83c\udf64",
    fish_cake: "\ud83c\udf65",
    moon_cake: "\ud83e\udd6e",
    dango: "\ud83c\udf61",
    dumpling: "\ud83e\udd5f",
    fortune_cookie: "\ud83e\udd60",
    takeout_box: "\ud83e\udd61",
    crab: "\ud83e\udd80",
    lobster: "\ud83e\udd9e",
    shrimp: "\ud83e\udd90",
    squid: "\ud83e\udd91",
    oyster: "\ud83e\uddaa",
    icecream: "\ud83c\udf66",
    shaved_ice: "\ud83c\udf67",
    ice_cream: "\ud83c\udf68",
    doughnut: "\ud83c\udf69",
    cookie: "\ud83c\udf6a",
    birthday: "\ud83c\udf82",
    cake: "\ud83c\udf70",
    cupcake: "\ud83e\uddc1",
    pie: "\ud83e\udd67",
    chocolate_bar: "\ud83c\udf6b",
    candy: "\ud83c\udf6c",
    lollipop: "\ud83c\udf6d",
    custard: "\ud83c\udf6e",
    honey_pot: "\ud83c\udf6f",
    baby_bottle: "\ud83c\udf7c",
    milk_glass: "\ud83e\udd5b",
    coffee: "\u2615",
    teapot: "\ud83e\uded6",
    tea: "\ud83c\udf75",
    sake: "\ud83c\udf76",
    champagne: "\ud83c\udf7e",
    wine_glass: "\ud83c\udf77",
    cocktail: "\ud83c\udf78",
    tropical_drink: "\ud83c\udf79",
    beer: "\ud83c\udf7a",
    beers: "\ud83c\udf7b",
    clinking_glasses: "\ud83e\udd42",
    tumbler_glass: "\ud83e\udd43",
    pouring_liquid: "\ud83e\uded7",
    cup_with_straw: "\ud83e\udd64",
    bubble_tea: "\ud83e\uddcb",
    beverage_box: "\ud83e\uddc3",
    mate: "\ud83e\uddc9",
    ice_cube: "\ud83e\uddca",
    chopsticks: "\ud83e\udd62",
    plate_with_cutlery: "\ud83c\udf7d\ufe0f",
    fork_and_knife: "\ud83c\udf74",
    spoon: "\ud83e\udd44",
    hocho: "\ud83d\udd2a",
    knife: "\ud83d\udd2a",
    jar: "\ud83e\uded9",
    amphora: "\ud83c\udffa",
    earth_africa: "\ud83c\udf0d",
    earth_americas: "\ud83c\udf0e",
    earth_asia: "\ud83c\udf0f",
    globe_with_meridians: "\ud83c\udf10",
    world_map: "\ud83d\uddfa\ufe0f",
    japan: "\ud83d\uddfe",
    compass: "\ud83e\udded",
    mountain_snow: "\ud83c\udfd4\ufe0f",
    mountain: "\u26f0\ufe0f",
    volcano: "\ud83c\udf0b",
    mount_fuji: "\ud83d\uddfb",
    camping: "\ud83c\udfd5\ufe0f",
    beach_umbrella: "\ud83c\udfd6\ufe0f",
    desert: "\ud83c\udfdc\ufe0f",
    desert_island: "\ud83c\udfdd\ufe0f",
    national_park: "\ud83c\udfde\ufe0f",
    stadium: "\ud83c\udfdf\ufe0f",
    classical_building: "\ud83c\udfdb\ufe0f",
    building_construction: "\ud83c\udfd7\ufe0f",
    bricks: "\ud83e\uddf1",
    rock: "\ud83e\udea8",
    wood: "\ud83e\udeb5",
    hut: "\ud83d\uded6",
    houses: "\ud83c\udfd8\ufe0f",
    derelict_house: "\ud83c\udfda\ufe0f",
    house: "\ud83c\udfe0",
    house_with_garden: "\ud83c\udfe1",
    office: "\ud83c\udfe2",
    post_office: "\ud83c\udfe3",
    european_post_office: "\ud83c\udfe4",
    hospital: "\ud83c\udfe5",
    bank: "\ud83c\udfe6",
    hotel: "\ud83c\udfe8",
    love_hotel: "\ud83c\udfe9",
    convenience_store: "\ud83c\udfea",
    school: "\ud83c\udfeb",
    department_store: "\ud83c\udfec",
    factory: "\ud83c\udfed",
    japanese_castle: "\ud83c\udfef",
    european_castle: "\ud83c\udff0",
    wedding: "\ud83d\udc92",
    tokyo_tower: "\ud83d\uddfc",
    statue_of_liberty: "\ud83d\uddfd",
    church: "\u26ea",
    mosque: "\ud83d\udd4c",
    hindu_temple: "\ud83d\uded5",
    synagogue: "\ud83d\udd4d",
    shinto_shrine: "\u26e9\ufe0f",
    kaaba: "\ud83d\udd4b",
    fountain: "\u26f2",
    tent: "\u26fa",
    foggy: "\ud83c\udf01",
    night_with_stars: "\ud83c\udf03",
    cityscape: "\ud83c\udfd9\ufe0f",
    sunrise_over_mountains: "\ud83c\udf04",
    sunrise: "\ud83c\udf05",
    city_sunset: "\ud83c\udf06",
    city_sunrise: "\ud83c\udf07",
    bridge_at_night: "\ud83c\udf09",
    hotsprings: "\u2668\ufe0f",
    carousel_horse: "\ud83c\udfa0",
    playground_slide: "\ud83d\udedd",
    ferris_wheel: "\ud83c\udfa1",
    roller_coaster: "\ud83c\udfa2",
    barber: "\ud83d\udc88",
    circus_tent: "\ud83c\udfaa",
    steam_locomotive: "\ud83d\ude82",
    railway_car: "\ud83d\ude83",
    bullettrain_side: "\ud83d\ude84",
    bullettrain_front: "\ud83d\ude85",
    train2: "\ud83d\ude86",
    metro: "\ud83d\ude87",
    light_rail: "\ud83d\ude88",
    station: "\ud83d\ude89",
    tram: "\ud83d\ude8a",
    monorail: "\ud83d\ude9d",
    mountain_railway: "\ud83d\ude9e",
    train: "\ud83d\ude8b",
    bus: "\ud83d\ude8c",
    oncoming_bus: "\ud83d\ude8d",
    trolleybus: "\ud83d\ude8e",
    minibus: "\ud83d\ude90",
    ambulance: "\ud83d\ude91",
    fire_engine: "\ud83d\ude92",
    police_car: "\ud83d\ude93",
    oncoming_police_car: "\ud83d\ude94",
    taxi: "\ud83d\ude95",
    oncoming_taxi: "\ud83d\ude96",
    car: "\ud83d\ude97",
    red_car: "\ud83d\ude97",
    oncoming_automobile: "\ud83d\ude98",
    blue_car: "\ud83d\ude99",
    pickup_truck: "\ud83d\udefb",
    truck: "\ud83d\ude9a",
    articulated_lorry: "\ud83d\ude9b",
    tractor: "\ud83d\ude9c",
    racing_car: "\ud83c\udfce\ufe0f",
    motorcycle: "\ud83c\udfcd\ufe0f",
    motor_scooter: "\ud83d\udef5",
    manual_wheelchair: "\ud83e\uddbd",
    motorized_wheelchair: "\ud83e\uddbc",
    auto_rickshaw: "\ud83d\udefa",
    bike: "\ud83d\udeb2",
    kick_scooter: "\ud83d\udef4",
    skateboard: "\ud83d\udef9",
    roller_skate: "\ud83d\udefc",
    busstop: "\ud83d\ude8f",
    motorway: "\ud83d\udee3\ufe0f",
    railway_track: "\ud83d\udee4\ufe0f",
    oil_drum: "\ud83d\udee2\ufe0f",
    fuelpump: "\u26fd",
    wheel: "\ud83d\udede",
    rotating_light: "\ud83d\udea8",
    traffic_light: "\ud83d\udea5",
    vertical_traffic_light: "\ud83d\udea6",
    stop_sign: "\ud83d\uded1",
    construction: "\ud83d\udea7",
    anchor: "\u2693",
    ring_buoy: "\ud83d\udedf",
    boat: "\u26f5",
    sailboat: "\u26f5",
    canoe: "\ud83d\udef6",
    speedboat: "\ud83d\udea4",
    passenger_ship: "\ud83d\udef3\ufe0f",
    ferry: "\u26f4\ufe0f",
    motor_boat: "\ud83d\udee5\ufe0f",
    ship: "\ud83d\udea2",
    airplane: "\u2708\ufe0f",
    small_airplane: "\ud83d\udee9\ufe0f",
    flight_departure: "\ud83d\udeeb",
    flight_arrival: "\ud83d\udeec",
    parachute: "\ud83e\ude82",
    seat: "\ud83d\udcba",
    helicopter: "\ud83d\ude81",
    suspension_railway: "\ud83d\ude9f",
    mountain_cableway: "\ud83d\udea0",
    aerial_tramway: "\ud83d\udea1",
    artificial_satellite: "\ud83d\udef0\ufe0f",
    rocket: "\ud83d\ude80",
    flying_saucer: "\ud83d\udef8",
    bellhop_bell: "\ud83d\udece\ufe0f",
    luggage: "\ud83e\uddf3",
    hourglass: "\u231b",
    hourglass_flowing_sand: "\u23f3",
    watch: "\u231a",
    alarm_clock: "\u23f0",
    stopwatch: "\u23f1\ufe0f",
    timer_clock: "\u23f2\ufe0f",
    mantelpiece_clock: "\ud83d\udd70\ufe0f",
    clock12: "\ud83d\udd5b",
    clock1230: "\ud83d\udd67",
    clock1: "\ud83d\udd50",
    clock130: "\ud83d\udd5c",
    clock2: "\ud83d\udd51",
    clock230: "\ud83d\udd5d",
    clock3: "\ud83d\udd52",
    clock330: "\ud83d\udd5e",
    clock4: "\ud83d\udd53",
    clock430: "\ud83d\udd5f",
    clock5: "\ud83d\udd54",
    clock530: "\ud83d\udd60",
    clock6: "\ud83d\udd55",
    clock630: "\ud83d\udd61",
    clock7: "\ud83d\udd56",
    clock730: "\ud83d\udd62",
    clock8: "\ud83d\udd57",
    clock830: "\ud83d\udd63",
    clock9: "\ud83d\udd58",
    clock930: "\ud83d\udd64",
    clock10: "\ud83d\udd59",
    clock1030: "\ud83d\udd65",
    clock11: "\ud83d\udd5a",
    clock1130: "\ud83d\udd66",
    new_moon: "\ud83c\udf11",
    waxing_crescent_moon: "\ud83c\udf12",
    first_quarter_moon: "\ud83c\udf13",
    moon: "\ud83c\udf14",
    waxing_gibbous_moon: "\ud83c\udf14",
    full_moon: "\ud83c\udf15",
    waning_gibbous_moon: "\ud83c\udf16",
    last_quarter_moon: "\ud83c\udf17",
    waning_crescent_moon: "\ud83c\udf18",
    crescent_moon: "\ud83c\udf19",
    new_moon_with_face: "\ud83c\udf1a",
    first_quarter_moon_with_face: "\ud83c\udf1b",
    last_quarter_moon_with_face: "\ud83c\udf1c",
    thermometer: "\ud83c\udf21\ufe0f",
    sunny: "\u2600\ufe0f",
    full_moon_with_face: "\ud83c\udf1d",
    sun_with_face: "\ud83c\udf1e",
    ringed_planet: "\ud83e\ude90",
    star: "\u2b50",
    star2: "\ud83c\udf1f",
    stars: "\ud83c\udf20",
    milky_way: "\ud83c\udf0c",
    cloud: "\u2601\ufe0f",
    partly_sunny: "\u26c5",
    cloud_with_lightning_and_rain: "\u26c8\ufe0f",
    sun_behind_small_cloud: "\ud83c\udf24\ufe0f",
    sun_behind_large_cloud: "\ud83c\udf25\ufe0f",
    sun_behind_rain_cloud: "\ud83c\udf26\ufe0f",
    cloud_with_rain: "\ud83c\udf27\ufe0f",
    cloud_with_snow: "\ud83c\udf28\ufe0f",
    cloud_with_lightning: "\ud83c\udf29\ufe0f",
    tornado: "\ud83c\udf2a\ufe0f",
    fog: "\ud83c\udf2b\ufe0f",
    wind_face: "\ud83c\udf2c\ufe0f",
    cyclone: "\ud83c\udf00",
    rainbow: "\ud83c\udf08",
    closed_umbrella: "\ud83c\udf02",
    open_umbrella: "\u2602\ufe0f",
    umbrella: "\u2614",
    parasol_on_ground: "\u26f1\ufe0f",
    zap: "\u26a1",
    snowflake: "\u2744\ufe0f",
    snowman_with_snow: "\u2603\ufe0f",
    snowman: "\u26c4",
    comet: "\u2604\ufe0f",
    fire: "\ud83d\udd25",
    droplet: "\ud83d\udca7",
    ocean: "\ud83c\udf0a",
    jack_o_lantern: "\ud83c\udf83",
    christmas_tree: "\ud83c\udf84",
    fireworks: "\ud83c\udf86",
    sparkler: "\ud83c\udf87",
    firecracker: "\ud83e\udde8",
    sparkles: "\u2728",
    balloon: "\ud83c\udf88",
    tada: "\ud83c\udf89",
    confetti_ball: "\ud83c\udf8a",
    tanabata_tree: "\ud83c\udf8b",
    bamboo: "\ud83c\udf8d",
    dolls: "\ud83c\udf8e",
    flags: "\ud83c\udf8f",
    wind_chime: "\ud83c\udf90",
    rice_scene: "\ud83c\udf91",
    red_envelope: "\ud83e\udde7",
    ribbon: "\ud83c\udf80",
    gift: "\ud83c\udf81",
    reminder_ribbon: "\ud83c\udf97\ufe0f",
    tickets: "\ud83c\udf9f\ufe0f",
    ticket: "\ud83c\udfab",
    medal_military: "\ud83c\udf96\ufe0f",
    trophy: "\ud83c\udfc6",
    medal_sports: "\ud83c\udfc5",
    "1st_place_medal": "\ud83e\udd47",
    "2nd_place_medal": "\ud83e\udd48",
    "3rd_place_medal": "\ud83e\udd49",
    soccer: "\u26bd",
    baseball: "\u26be",
    softball: "\ud83e\udd4e",
    basketball: "\ud83c\udfc0",
    volleyball: "\ud83c\udfd0",
    football: "\ud83c\udfc8",
    rugby_football: "\ud83c\udfc9",
    tennis: "\ud83c\udfbe",
    flying_disc: "\ud83e\udd4f",
    bowling: "\ud83c\udfb3",
    cricket_game: "\ud83c\udfcf",
    field_hockey: "\ud83c\udfd1",
    ice_hockey: "\ud83c\udfd2",
    lacrosse: "\ud83e\udd4d",
    ping_pong: "\ud83c\udfd3",
    badminton: "\ud83c\udff8",
    boxing_glove: "\ud83e\udd4a",
    martial_arts_uniform: "\ud83e\udd4b",
    goal_net: "\ud83e\udd45",
    golf: "\u26f3",
    ice_skate: "\u26f8\ufe0f",
    fishing_pole_and_fish: "\ud83c\udfa3",
    diving_mask: "\ud83e\udd3f",
    running_shirt_with_sash: "\ud83c\udfbd",
    ski: "\ud83c\udfbf",
    sled: "\ud83d\udef7",
    curling_stone: "\ud83e\udd4c",
    dart: "\ud83c\udfaf",
    yo_yo: "\ud83e\ude80",
    kite: "\ud83e\ude81",
    gun: "\ud83d\udd2b",
    "8ball": "\ud83c\udfb1",
    crystal_ball: "\ud83d\udd2e",
    magic_wand: "\ud83e\ude84",
    video_game: "\ud83c\udfae",
    joystick: "\ud83d\udd79\ufe0f",
    slot_machine: "\ud83c\udfb0",
    game_die: "\ud83c\udfb2",
    jigsaw: "\ud83e\udde9",
    teddy_bear: "\ud83e\uddf8",
    pinata: "\ud83e\ude85",
    mirror_ball: "\ud83e\udea9",
    nesting_dolls: "\ud83e\ude86",
    spades: "\u2660\ufe0f",
    hearts: "\u2665\ufe0f",
    diamonds: "\u2666\ufe0f",
    clubs: "\u2663\ufe0f",
    chess_pawn: "\u265f\ufe0f",
    black_joker: "\ud83c\udccf",
    mahjong: "\ud83c\udc04",
    flower_playing_cards: "\ud83c\udfb4",
    performing_arts: "\ud83c\udfad",
    framed_picture: "\ud83d\uddbc\ufe0f",
    art: "\ud83c\udfa8",
    thread: "\ud83e\uddf5",
    sewing_needle: "\ud83e\udea1",
    yarn: "\ud83e\uddf6",
    knot: "\ud83e\udea2",
    eyeglasses: "\ud83d\udc53",
    dark_sunglasses: "\ud83d\udd76\ufe0f",
    goggles: "\ud83e\udd7d",
    lab_coat: "\ud83e\udd7c",
    safety_vest: "\ud83e\uddba",
    necktie: "\ud83d\udc54",
    shirt: "\ud83d\udc55",
    tshirt: "\ud83d\udc55",
    jeans: "\ud83d\udc56",
    scarf: "\ud83e\udde3",
    gloves: "\ud83e\udde4",
    coat: "\ud83e\udde5",
    socks: "\ud83e\udde6",
    dress: "\ud83d\udc57",
    kimono: "\ud83d\udc58",
    sari: "\ud83e\udd7b",
    one_piece_swimsuit: "\ud83e\ude71",
    swim_brief: "\ud83e\ude72",
    shorts: "\ud83e\ude73",
    bikini: "\ud83d\udc59",
    womans_clothes: "\ud83d\udc5a",
    folding_hand_fan: "\ud83e\udead",
    purse: "\ud83d\udc5b",
    handbag: "\ud83d\udc5c",
    pouch: "\ud83d\udc5d",
    shopping: "\ud83d\udecd\ufe0f",
    school_satchel: "\ud83c\udf92",
    thong_sandal: "\ud83e\ude74",
    mans_shoe: "\ud83d\udc5e",
    shoe: "\ud83d\udc5e",
    athletic_shoe: "\ud83d\udc5f",
    hiking_boot: "\ud83e\udd7e",
    flat_shoe: "\ud83e\udd7f",
    high_heel: "\ud83d\udc60",
    sandal: "\ud83d\udc61",
    ballet_shoes: "\ud83e\ude70",
    boot: "\ud83d\udc62",
    hair_pick: "\ud83e\udeae",
    crown: "\ud83d\udc51",
    womans_hat: "\ud83d\udc52",
    tophat: "\ud83c\udfa9",
    mortar_board: "\ud83c\udf93",
    billed_cap: "\ud83e\udde2",
    military_helmet: "\ud83e\ude96",
    rescue_worker_helmet: "\u26d1\ufe0f",
    prayer_beads: "\ud83d\udcff",
    lipstick: "\ud83d\udc84",
    ring: "\ud83d\udc8d",
    gem: "\ud83d\udc8e",
    mute: "\ud83d\udd07",
    speaker: "\ud83d\udd08",
    sound: "\ud83d\udd09",
    loud_sound: "\ud83d\udd0a",
    loudspeaker: "\ud83d\udce2",
    mega: "\ud83d\udce3",
    postal_horn: "\ud83d\udcef",
    bell: "\ud83d\udd14",
    no_bell: "\ud83d\udd15",
    musical_score: "\ud83c\udfbc",
    musical_note: "\ud83c\udfb5",
    notes: "\ud83c\udfb6",
    studio_microphone: "\ud83c\udf99\ufe0f",
    level_slider: "\ud83c\udf9a\ufe0f",
    control_knobs: "\ud83c\udf9b\ufe0f",
    microphone: "\ud83c\udfa4",
    headphones: "\ud83c\udfa7",
    radio: "\ud83d\udcfb",
    saxophone: "\ud83c\udfb7",
    accordion: "\ud83e\ude97",
    guitar: "\ud83c\udfb8",
    musical_keyboard: "\ud83c\udfb9",
    trumpet: "\ud83c\udfba",
    violin: "\ud83c\udfbb",
    banjo: "\ud83e\ude95",
    drum: "\ud83e\udd41",
    long_drum: "\ud83e\ude98",
    maracas: "\ud83e\ude87",
    flute: "\ud83e\ude88",
    iphone: "\ud83d\udcf1",
    calling: "\ud83d\udcf2",
    phone: "\u260e\ufe0f",
    telephone: "\u260e\ufe0f",
    telephone_receiver: "\ud83d\udcde",
    pager: "\ud83d\udcdf",
    fax: "\ud83d\udce0",
    battery: "\ud83d\udd0b",
    low_battery: "\ud83e\udeab",
    electric_plug: "\ud83d\udd0c",
    computer: "\ud83d\udcbb",
    desktop_computer: "\ud83d\udda5\ufe0f",
    printer: "\ud83d\udda8\ufe0f",
    keyboard: "\u2328\ufe0f",
    computer_mouse: "\ud83d\uddb1\ufe0f",
    trackball: "\ud83d\uddb2\ufe0f",
    minidisc: "\ud83d\udcbd",
    floppy_disk: "\ud83d\udcbe",
    cd: "\ud83d\udcbf",
    dvd: "\ud83d\udcc0",
    abacus: "\ud83e\uddee",
    movie_camera: "\ud83c\udfa5",
    film_strip: "\ud83c\udf9e\ufe0f",
    film_projector: "\ud83d\udcfd\ufe0f",
    clapper: "\ud83c\udfac",
    tv: "\ud83d\udcfa",
    camera: "\ud83d\udcf7",
    camera_flash: "\ud83d\udcf8",
    video_camera: "\ud83d\udcf9",
    vhs: "\ud83d\udcfc",
    mag: "\ud83d\udd0d",
    mag_right: "\ud83d\udd0e",
    candle: "\ud83d\udd6f\ufe0f",
    bulb: "\ud83d\udca1",
    flashlight: "\ud83d\udd26",
    izakaya_lantern: "\ud83c\udfee",
    lantern: "\ud83c\udfee",
    diya_lamp: "\ud83e\ude94",
    notebook_with_decorative_cover: "\ud83d\udcd4",
    closed_book: "\ud83d\udcd5",
    book: "\ud83d\udcd6",
    open_book: "\ud83d\udcd6",
    green_book: "\ud83d\udcd7",
    blue_book: "\ud83d\udcd8",
    orange_book: "\ud83d\udcd9",
    books: "\ud83d\udcda",
    notebook: "\ud83d\udcd3",
    ledger: "\ud83d\udcd2",
    page_with_curl: "\ud83d\udcc3",
    scroll: "\ud83d\udcdc",
    page_facing_up: "\ud83d\udcc4",
    newspaper: "\ud83d\udcf0",
    newspaper_roll: "\ud83d\uddde\ufe0f",
    bookmark_tabs: "\ud83d\udcd1",
    bookmark: "\ud83d\udd16",
    label: "\ud83c\udff7\ufe0f",
    moneybag: "\ud83d\udcb0",
    coin: "\ud83e\ude99",
    yen: "\ud83d\udcb4",
    dollar: "\ud83d\udcb5",
    euro: "\ud83d\udcb6",
    pound: "\ud83d\udcb7",
    money_with_wings: "\ud83d\udcb8",
    credit_card: "\ud83d\udcb3",
    receipt: "\ud83e\uddfe",
    chart: "\ud83d\udcb9",
    envelope: "\u2709\ufe0f",
    email: "\ud83d\udce7",
    "e-mail": "\ud83d\udce7",
    incoming_envelope: "\ud83d\udce8",
    envelope_with_arrow: "\ud83d\udce9",
    outbox_tray: "\ud83d\udce4",
    inbox_tray: "\ud83d\udce5",
    package: "\ud83d\udce6",
    mailbox: "\ud83d\udceb",
    mailbox_closed: "\ud83d\udcea",
    mailbox_with_mail: "\ud83d\udcec",
    mailbox_with_no_mail: "\ud83d\udced",
    postbox: "\ud83d\udcee",
    ballot_box: "\ud83d\uddf3\ufe0f",
    pencil2: "\u270f\ufe0f",
    black_nib: "\u2712\ufe0f",
    fountain_pen: "\ud83d\udd8b\ufe0f",
    pen: "\ud83d\udd8a\ufe0f",
    paintbrush: "\ud83d\udd8c\ufe0f",
    crayon: "\ud83d\udd8d\ufe0f",
    memo: "\ud83d\udcdd",
    pencil: "\ud83d\udcdd",
    briefcase: "\ud83d\udcbc",
    file_folder: "\ud83d\udcc1",
    open_file_folder: "\ud83d\udcc2",
    card_index_dividers: "\ud83d\uddc2\ufe0f",
    date: "\ud83d\udcc5",
    calendar: "\ud83d\udcc6",
    spiral_notepad: "\ud83d\uddd2\ufe0f",
    spiral_calendar: "\ud83d\uddd3\ufe0f",
    card_index: "\ud83d\udcc7",
    chart_with_upwards_trend: "\ud83d\udcc8",
    chart_with_downwards_trend: "\ud83d\udcc9",
    bar_chart: "\ud83d\udcca",
    clipboard: "\ud83d\udccb",
    pushpin: "\ud83d\udccc",
    round_pushpin: "\ud83d\udccd",
    paperclip: "\ud83d\udcce",
    paperclips: "\ud83d\udd87\ufe0f",
    straight_ruler: "\ud83d\udccf",
    triangular_ruler: "\ud83d\udcd0",
    scissors: "\u2702\ufe0f",
    card_file_box: "\ud83d\uddc3\ufe0f",
    file_cabinet: "\ud83d\uddc4\ufe0f",
    wastebasket: "\ud83d\uddd1\ufe0f",
    lock: "\ud83d\udd12",
    unlock: "\ud83d\udd13",
    lock_with_ink_pen: "\ud83d\udd0f",
    closed_lock_with_key: "\ud83d\udd10",
    key: "\ud83d\udd11",
    old_key: "\ud83d\udddd\ufe0f",
    hammer: "\ud83d\udd28",
    axe: "\ud83e\ude93",
    pick: "\u26cf\ufe0f",
    hammer_and_pick: "\u2692\ufe0f",
    hammer_and_wrench: "\ud83d\udee0\ufe0f",
    dagger: "\ud83d\udde1\ufe0f",
    crossed_swords: "\u2694\ufe0f",
    bomb: "\ud83d\udca3",
    boomerang: "\ud83e\ude83",
    bow_and_arrow: "\ud83c\udff9",
    shield: "\ud83d\udee1\ufe0f",
    carpentry_saw: "\ud83e\ude9a",
    wrench: "\ud83d\udd27",
    screwdriver: "\ud83e\ude9b",
    nut_and_bolt: "\ud83d\udd29",
    gear: "\u2699\ufe0f",
    clamp: "\ud83d\udddc\ufe0f",
    balance_scale: "\u2696\ufe0f",
    probing_cane: "\ud83e\uddaf",
    link: "\ud83d\udd17",
    chains: "\u26d3\ufe0f",
    hook: "\ud83e\ude9d",
    toolbox: "\ud83e\uddf0",
    magnet: "\ud83e\uddf2",
    ladder: "\ud83e\ude9c",
    alembic: "\u2697\ufe0f",
    test_tube: "\ud83e\uddea",
    petri_dish: "\ud83e\uddeb",
    dna: "\ud83e\uddec",
    microscope: "\ud83d\udd2c",
    telescope: "\ud83d\udd2d",
    satellite: "\ud83d\udce1",
    syringe: "\ud83d\udc89",
    drop_of_blood: "\ud83e\ude78",
    pill: "\ud83d\udc8a",
    adhesive_bandage: "\ud83e\ude79",
    crutch: "\ud83e\ude7c",
    stethoscope: "\ud83e\ude7a",
    x_ray: "\ud83e\ude7b",
    door: "\ud83d\udeaa",
    elevator: "\ud83d\uded7",
    mirror: "\ud83e\ude9e",
    window: "\ud83e\ude9f",
    bed: "\ud83d\udecf\ufe0f",
    couch_and_lamp: "\ud83d\udecb\ufe0f",
    chair: "\ud83e\ude91",
    toilet: "\ud83d\udebd",
    plunger: "\ud83e\udea0",
    shower: "\ud83d\udebf",
    bathtub: "\ud83d\udec1",
    mouse_trap: "\ud83e\udea4",
    razor: "\ud83e\ude92",
    lotion_bottle: "\ud83e\uddf4",
    safety_pin: "\ud83e\uddf7",
    broom: "\ud83e\uddf9",
    basket: "\ud83e\uddfa",
    roll_of_paper: "\ud83e\uddfb",
    bucket: "\ud83e\udea3",
    soap: "\ud83e\uddfc",
    bubbles: "\ud83e\udee7",
    toothbrush: "\ud83e\udea5",
    sponge: "\ud83e\uddfd",
    fire_extinguisher: "\ud83e\uddef",
    shopping_cart: "\ud83d\uded2",
    smoking: "\ud83d\udeac",
    coffin: "\u26b0\ufe0f",
    headstone: "\ud83e\udea6",
    funeral_urn: "\u26b1\ufe0f",
    nazar_amulet: "\ud83e\uddff",
    hamsa: "\ud83e\udeac",
    moyai: "\ud83d\uddff",
    placard: "\ud83e\udea7",
    identification_card: "\ud83e\udeaa",
    atm: "\ud83c\udfe7",
    put_litter_in_its_place: "\ud83d\udeae",
    potable_water: "\ud83d\udeb0",
    wheelchair: "\u267f",
    mens: "\ud83d\udeb9",
    womens: "\ud83d\udeba",
    restroom: "\ud83d\udebb",
    baby_symbol: "\ud83d\udebc",
    wc: "\ud83d\udebe",
    passport_control: "\ud83d\udec2",
    customs: "\ud83d\udec3",
    baggage_claim: "\ud83d\udec4",
    left_luggage: "\ud83d\udec5",
    warning: "\u26a0\ufe0f",
    children_crossing: "\ud83d\udeb8",
    no_entry: "\u26d4",
    no_entry_sign: "\ud83d\udeab",
    no_bicycles: "\ud83d\udeb3",
    no_smoking: "\ud83d\udead",
    do_not_litter: "\ud83d\udeaf",
    "non-potable_water": "\ud83d\udeb1",
    no_pedestrians: "\ud83d\udeb7",
    no_mobile_phones: "\ud83d\udcf5",
    underage: "\ud83d\udd1e",
    radioactive: "\u2622\ufe0f",
    biohazard: "\u2623\ufe0f",
    arrow_up: "\u2b06\ufe0f",
    arrow_upper_right: "\u2197\ufe0f",
    arrow_right: "\u27a1\ufe0f",
    arrow_lower_right: "\u2198\ufe0f",
    arrow_down: "\u2b07\ufe0f",
    arrow_lower_left: "\u2199\ufe0f",
    arrow_left: "\u2b05\ufe0f",
    arrow_upper_left: "\u2196\ufe0f",
    arrow_up_down: "\u2195\ufe0f",
    left_right_arrow: "\u2194\ufe0f",
    leftwards_arrow_with_hook: "\u21a9\ufe0f",
    arrow_right_hook: "\u21aa\ufe0f",
    arrow_heading_up: "\u2934\ufe0f",
    arrow_heading_down: "\u2935\ufe0f",
    arrows_clockwise: "\ud83d\udd03",
    arrows_counterclockwise: "\ud83d\udd04",
    back: "\ud83d\udd19",
    end: "\ud83d\udd1a",
    on: "\ud83d\udd1b",
    soon: "\ud83d\udd1c",
    top: "\ud83d\udd1d",
    place_of_worship: "\ud83d\uded0",
    atom_symbol: "\u269b\ufe0f",
    om: "\ud83d\udd49\ufe0f",
    star_of_david: "\u2721\ufe0f",
    wheel_of_dharma: "\u2638\ufe0f",
    yin_yang: "\u262f\ufe0f",
    latin_cross: "\u271d\ufe0f",
    orthodox_cross: "\u2626\ufe0f",
    star_and_crescent: "\u262a\ufe0f",
    peace_symbol: "\u262e\ufe0f",
    menorah: "\ud83d\udd4e",
    six_pointed_star: "\ud83d\udd2f",
    khanda: "\ud83e\udeaf",
    aries: "\u2648",
    taurus: "\u2649",
    gemini: "\u264a",
    cancer: "\u264b",
    leo: "\u264c",
    virgo: "\u264d",
    libra: "\u264e",
    scorpius: "\u264f",
    sagittarius: "\u2650",
    capricorn: "\u2651",
    aquarius: "\u2652",
    pisces: "\u2653",
    ophiuchus: "\u26ce",
    twisted_rightwards_arrows: "\ud83d\udd00",
    repeat: "\ud83d\udd01",
    repeat_one: "\ud83d\udd02",
    arrow_forward: "\u25b6\ufe0f",
    fast_forward: "\u23e9",
    next_track_button: "\u23ed\ufe0f",
    play_or_pause_button: "\u23ef\ufe0f",
    arrow_backward: "\u25c0\ufe0f",
    rewind: "\u23ea",
    previous_track_button: "\u23ee\ufe0f",
    arrow_up_small: "\ud83d\udd3c",
    arrow_double_up: "\u23eb",
    arrow_down_small: "\ud83d\udd3d",
    arrow_double_down: "\u23ec",
    pause_button: "\u23f8\ufe0f",
    stop_button: "\u23f9\ufe0f",
    record_button: "\u23fa\ufe0f",
    eject_button: "\u23cf\ufe0f",
    cinema: "\ud83c\udfa6",
    low_brightness: "\ud83d\udd05",
    high_brightness: "\ud83d\udd06",
    signal_strength: "\ud83d\udcf6",
    wireless: "\ud83d\udedc",
    vibration_mode: "\ud83d\udcf3",
    mobile_phone_off: "\ud83d\udcf4",
    female_sign: "\u2640\ufe0f",
    male_sign: "\u2642\ufe0f",
    transgender_symbol: "\u26a7\ufe0f",
    heavy_multiplication_x: "\u2716\ufe0f",
    heavy_plus_sign: "\u2795",
    heavy_minus_sign: "\u2796",
    heavy_division_sign: "\u2797",
    heavy_equals_sign: "\ud83d\udff0",
    infinity: "\u267e\ufe0f",
    bangbang: "\u203c\ufe0f",
    interrobang: "\u2049\ufe0f",
    question: "\u2753",
    grey_question: "\u2754",
    grey_exclamation: "\u2755",
    exclamation: "\u2757",
    heavy_exclamation_mark: "\u2757",
    wavy_dash: "\u3030\ufe0f",
    currency_exchange: "\ud83d\udcb1",
    heavy_dollar_sign: "\ud83d\udcb2",
    medical_symbol: "\u2695\ufe0f",
    recycle: "\u267b\ufe0f",
    fleur_de_lis: "\u269c\ufe0f",
    trident: "\ud83d\udd31",
    name_badge: "\ud83d\udcdb",
    beginner: "\ud83d\udd30",
    o: "\u2b55",
    white_check_mark: "\u2705",
    ballot_box_with_check: "\u2611\ufe0f",
    heavy_check_mark: "\u2714\ufe0f",
    x: "\u274c",
    negative_squared_cross_mark: "\u274e",
    curly_loop: "\u27b0",
    loop: "\u27bf",
    part_alternation_mark: "\u303d\ufe0f",
    eight_spoked_asterisk: "\u2733\ufe0f",
    eight_pointed_black_star: "\u2734\ufe0f",
    sparkle: "\u2747\ufe0f",
    copyright: "\xa9\ufe0f",
    registered: "\xae\ufe0f",
    tm: "\u2122\ufe0f",
    hash: "#\ufe0f\u20e3",
    asterisk: "*\ufe0f\u20e3",
    zero: "0\ufe0f\u20e3",
    one: "1\ufe0f\u20e3",
    two: "2\ufe0f\u20e3",
    three: "3\ufe0f\u20e3",
    four: "4\ufe0f\u20e3",
    five: "5\ufe0f\u20e3",
    six: "6\ufe0f\u20e3",
    seven: "7\ufe0f\u20e3",
    eight: "8\ufe0f\u20e3",
    nine: "9\ufe0f\u20e3",
    keycap_ten: "\ud83d\udd1f",
    capital_abcd: "\ud83d\udd20",
    abcd: "\ud83d\udd21",
    symbols: "\ud83d\udd23",
    abc: "\ud83d\udd24",
    a: "\ud83c\udd70\ufe0f",
    ab: "\ud83c\udd8e",
    b: "\ud83c\udd71\ufe0f",
    cl: "\ud83c\udd91",
    cool: "\ud83c\udd92",
    free: "\ud83c\udd93",
    information_source: "\u2139\ufe0f",
    id: "\ud83c\udd94",
    m: "\u24c2\ufe0f",
    new: "\ud83c\udd95",
    ng: "\ud83c\udd96",
    o2: "\ud83c\udd7e\ufe0f",
    ok: "\ud83c\udd97",
    parking: "\ud83c\udd7f\ufe0f",
    sos: "\ud83c\udd98",
    up: "\ud83c\udd99",
    vs: "\ud83c\udd9a",
    koko: "\ud83c\ude01",
    sa: "\ud83c\ude02\ufe0f",
    ideograph_advantage: "\ud83c\ude50",
    accept: "\ud83c\ude51",
    congratulations: "\u3297\ufe0f",
    secret: "\u3299\ufe0f",
    u6e80: "\ud83c\ude35",
    red_circle: "\ud83d\udd34",
    orange_circle: "\ud83d\udfe0",
    yellow_circle: "\ud83d\udfe1",
    green_circle: "\ud83d\udfe2",
    large_blue_circle: "\ud83d\udd35",
    purple_circle: "\ud83d\udfe3",
    brown_circle: "\ud83d\udfe4",
    black_circle: "\u26ab",
    white_circle: "\u26aa",
    red_square: "\ud83d\udfe5",
    orange_square: "\ud83d\udfe7",
    yellow_square: "\ud83d\udfe8",
    green_square: "\ud83d\udfe9",
    blue_square: "\ud83d\udfe6",
    purple_square: "\ud83d\udfea",
    brown_square: "\ud83d\udfeb",
    black_large_square: "\u2b1b",
    white_large_square: "\u2b1c",
    black_medium_square: "\u25fc\ufe0f",
    white_medium_square: "\u25fb\ufe0f",
    black_medium_small_square: "\u25fe",
    white_medium_small_square: "\u25fd",
    black_small_square: "\u25aa\ufe0f",
    white_small_square: "\u25ab\ufe0f",
    large_orange_diamond: "\ud83d\udd36",
    large_blue_diamond: "\ud83d\udd37",
    small_orange_diamond: "\ud83d\udd38",
    small_blue_diamond: "\ud83d\udd39",
    small_red_triangle: "\ud83d\udd3a",
    small_red_triangle_down: "\ud83d\udd3b",
    diamond_shape_with_a_dot_inside: "\ud83d\udca0",
    radio_button: "\ud83d\udd18",
    white_square_button: "\ud83d\udd33",
    black_square_button: "\ud83d\udd32",
    checkered_flag: "\ud83c\udfc1",
    triangular_flag_on_post: "\ud83d\udea9",
    crossed_flags: "\ud83c\udf8c",
    black_flag: "\ud83c\udff4",
    white_flag: "\ud83c\udff3\ufe0f",
    rainbow_flag: "\ud83c\udff3\ufe0f\u200d\ud83c\udf08",
    transgender_flag: "\ud83c\udff3\ufe0f\u200d\u26a7\ufe0f",
    pirate_flag: "\ud83c\udff4\u200d\u2620\ufe0f",
    ascension_island: "\ud83c\udde6\ud83c\udde8",
    andorra: "\ud83c\udde6\ud83c\udde9",
    united_arab_emirates: "\ud83c\udde6\ud83c\uddea",
    afghanistan: "\ud83c\udde6\ud83c\uddeb",
    antigua_barbuda: "\ud83c\udde6\ud83c\uddec",
    anguilla: "\ud83c\udde6\ud83c\uddee",
    albania: "\ud83c\udde6\ud83c\uddf1",
    armenia: "\ud83c\udde6\ud83c\uddf2",
    angola: "\ud83c\udde6\ud83c\uddf4",
    antarctica: "\ud83c\udde6\ud83c\uddf6",
    argentina: "\ud83c\udde6\ud83c\uddf7",
    american_samoa: "\ud83c\udde6\ud83c\uddf8",
    austria: "\ud83c\udde6\ud83c\uddf9",
    australia: "\ud83c\udde6\ud83c\uddfa",
    aruba: "\ud83c\udde6\ud83c\uddfc",
    aland_islands: "\ud83c\udde6\ud83c\uddfd",
    azerbaijan: "\ud83c\udde6\ud83c\uddff",
    bosnia_herzegovina: "\ud83c\udde7\ud83c\udde6",
    barbados: "\ud83c\udde7\ud83c\udde7",
    bangladesh: "\ud83c\udde7\ud83c\udde9",
    belgium: "\ud83c\udde7\ud83c\uddea",
    burkina_faso: "\ud83c\udde7\ud83c\uddeb",
    bulgaria: "\ud83c\udde7\ud83c\uddec",
    bahrain: "\ud83c\udde7\ud83c\udded",
    burundi: "\ud83c\udde7\ud83c\uddee",
    benin: "\ud83c\udde7\ud83c\uddef",
    st_barthelemy: "\ud83c\udde7\ud83c\uddf1",
    bermuda: "\ud83c\udde7\ud83c\uddf2",
    brunei: "\ud83c\udde7\ud83c\uddf3",
    bolivia: "\ud83c\udde7\ud83c\uddf4",
    caribbean_netherlands: "\ud83c\udde7\ud83c\uddf6",
    brazil: "\ud83c\udde7\ud83c\uddf7",
    bahamas: "\ud83c\udde7\ud83c\uddf8",
    bhutan: "\ud83c\udde7\ud83c\uddf9",
    bouvet_island: "\ud83c\udde7\ud83c\uddfb",
    botswana: "\ud83c\udde7\ud83c\uddfc",
    belarus: "\ud83c\udde7\ud83c\uddfe",
    belize: "\ud83c\udde7\ud83c\uddff",
    canada: "\ud83c\udde8\ud83c\udde6",
    cocos_islands: "\ud83c\udde8\ud83c\udde8",
    congo_kinshasa: "\ud83c\udde8\ud83c\udde9",
    central_african_republic: "\ud83c\udde8\ud83c\uddeb",
    congo_brazzaville: "\ud83c\udde8\ud83c\uddec",
    switzerland: "\ud83c\udde8\ud83c\udded",
    cote_divoire: "\ud83c\udde8\ud83c\uddee",
    cook_islands: "\ud83c\udde8\ud83c\uddf0",
    chile: "\ud83c\udde8\ud83c\uddf1",
    cameroon: "\ud83c\udde8\ud83c\uddf2",
    cn: "\ud83c\udde8\ud83c\uddf3",
    colombia: "\ud83c\udde8\ud83c\uddf4",
    clipperton_island: "\ud83c\udde8\ud83c\uddf5",
    costa_rica: "\ud83c\udde8\ud83c\uddf7",
    cuba: "\ud83c\udde8\ud83c\uddfa",
    cape_verde: "\ud83c\udde8\ud83c\uddfb",
    curacao: "\ud83c\udde8\ud83c\uddfc",
    christmas_island: "\ud83c\udde8\ud83c\uddfd",
    cyprus: "\ud83c\udde8\ud83c\uddfe",
    czech_republic: "\ud83c\udde8\ud83c\uddff",
    de: "\ud83c\udde9\ud83c\uddea",
    diego_garcia: "\ud83c\udde9\ud83c\uddec",
    djibouti: "\ud83c\udde9\ud83c\uddef",
    denmark: "\ud83c\udde9\ud83c\uddf0",
    dominica: "\ud83c\udde9\ud83c\uddf2",
    dominican_republic: "\ud83c\udde9\ud83c\uddf4",
    algeria: "\ud83c\udde9\ud83c\uddff",
    ceuta_melilla: "\ud83c\uddea\ud83c\udde6",
    ecuador: "\ud83c\uddea\ud83c\udde8",
    estonia: "\ud83c\uddea\ud83c\uddea",
    egypt: "\ud83c\uddea\ud83c\uddec",
    western_sahara: "\ud83c\uddea\ud83c\udded",
    eritrea: "\ud83c\uddea\ud83c\uddf7",
    es: "\ud83c\uddea\ud83c\uddf8",
    ethiopia: "\ud83c\uddea\ud83c\uddf9",
    eu: "\ud83c\uddea\ud83c\uddfa",
    european_union: "\ud83c\uddea\ud83c\uddfa",
    finland: "\ud83c\uddeb\ud83c\uddee",
    fiji: "\ud83c\uddeb\ud83c\uddef",
    falkland_islands: "\ud83c\uddeb\ud83c\uddf0",
    micronesia: "\ud83c\uddeb\ud83c\uddf2",
    faroe_islands: "\ud83c\uddeb\ud83c\uddf4",
    fr: "\ud83c\uddeb\ud83c\uddf7",
    gabon: "\ud83c\uddec\ud83c\udde6",
    gb: "\ud83c\uddec\ud83c\udde7",
    uk: "\ud83c\uddec\ud83c\udde7",
    grenada: "\ud83c\uddec\ud83c\udde9",
    georgia: "\ud83c\uddec\ud83c\uddea",
    french_guiana: "\ud83c\uddec\ud83c\uddeb",
    guernsey: "\ud83c\uddec\ud83c\uddec",
    ghana: "\ud83c\uddec\ud83c\udded",
    gibraltar: "\ud83c\uddec\ud83c\uddee",
    greenland: "\ud83c\uddec\ud83c\uddf1",
    gambia: "\ud83c\uddec\ud83c\uddf2",
    guinea: "\ud83c\uddec\ud83c\uddf3",
    guadeloupe: "\ud83c\uddec\ud83c\uddf5",
    equatorial_guinea: "\ud83c\uddec\ud83c\uddf6",
    greece: "\ud83c\uddec\ud83c\uddf7",
    south_georgia_south_sandwich_islands: "\ud83c\uddec\ud83c\uddf8",
    guatemala: "\ud83c\uddec\ud83c\uddf9",
    guam: "\ud83c\uddec\ud83c\uddfa",
    guinea_bissau: "\ud83c\uddec\ud83c\uddfc",
    guyana: "\ud83c\uddec\ud83c\uddfe",
    hong_kong: "\ud83c\udded\ud83c\uddf0",
    heard_mcdonald_islands: "\ud83c\udded\ud83c\uddf2",
    honduras: "\ud83c\udded\ud83c\uddf3",
    croatia: "\ud83c\udded\ud83c\uddf7",
    haiti: "\ud83c\udded\ud83c\uddf9",
    hungary: "\ud83c\udded\ud83c\uddfa",
    canary_islands: "\ud83c\uddee\ud83c\udde8",
    indonesia: "\ud83c\uddee\ud83c\udde9",
    ireland: "\ud83c\uddee\ud83c\uddea",
    israel: "\ud83c\uddee\ud83c\uddf1",
    isle_of_man: "\ud83c\uddee\ud83c\uddf2",
    india: "\ud83c\uddee\ud83c\uddf3",
    british_indian_ocean_territory: "\ud83c\uddee\ud83c\uddf4",
    iraq: "\ud83c\uddee\ud83c\uddf6",
    iran: "\ud83c\uddee\ud83c\uddf7",
    iceland: "\ud83c\uddee\ud83c\uddf8",
    it: "\ud83c\uddee\ud83c\uddf9",
    jersey: "\ud83c\uddef\ud83c\uddea",
    jamaica: "\ud83c\uddef\ud83c\uddf2",
    jordan: "\ud83c\uddef\ud83c\uddf4",
    jp: "\ud83c\uddef\ud83c\uddf5",
    kenya: "\ud83c\uddf0\ud83c\uddea",
    kyrgyzstan: "\ud83c\uddf0\ud83c\uddec",
    cambodia: "\ud83c\uddf0\ud83c\udded",
    kiribati: "\ud83c\uddf0\ud83c\uddee",
    comoros: "\ud83c\uddf0\ud83c\uddf2",
    st_kitts_nevis: "\ud83c\uddf0\ud83c\uddf3",
    north_korea: "\ud83c\uddf0\ud83c\uddf5",
    kr: "\ud83c\uddf0\ud83c\uddf7",
    kuwait: "\ud83c\uddf0\ud83c\uddfc",
    cayman_islands: "\ud83c\uddf0\ud83c\uddfe",
    kazakhstan: "\ud83c\uddf0\ud83c\uddff",
    laos: "\ud83c\uddf1\ud83c\udde6",
    lebanon: "\ud83c\uddf1\ud83c\udde7",
    st_lucia: "\ud83c\uddf1\ud83c\udde8",
    liechtenstein: "\ud83c\uddf1\ud83c\uddee",
    sri_lanka: "\ud83c\uddf1\ud83c\uddf0",
    liberia: "\ud83c\uddf1\ud83c\uddf7",
    lesotho: "\ud83c\uddf1\ud83c\uddf8",
    lithuania: "\ud83c\uddf1\ud83c\uddf9",
    luxembourg: "\ud83c\uddf1\ud83c\uddfa",
    latvia: "\ud83c\uddf1\ud83c\uddfb",
    libya: "\ud83c\uddf1\ud83c\uddfe",
    morocco: "\ud83c\uddf2\ud83c\udde6",
    monaco: "\ud83c\uddf2\ud83c\udde8",
    moldova: "\ud83c\uddf2\ud83c\udde9",
    montenegro: "\ud83c\uddf2\ud83c\uddea",
    st_martin: "\ud83c\uddf2\ud83c\uddeb",
    madagascar: "\ud83c\uddf2\ud83c\uddec",
    marshall_islands: "\ud83c\uddf2\ud83c\udded",
    macedonia: "\ud83c\uddf2\ud83c\uddf0",
    mali: "\ud83c\uddf2\ud83c\uddf1",
    myanmar: "\ud83c\uddf2\ud83c\uddf2",
    mongolia: "\ud83c\uddf2\ud83c\uddf3",
    macau: "\ud83c\uddf2\ud83c\uddf4",
    northern_mariana_islands: "\ud83c\uddf2\ud83c\uddf5",
    martinique: "\ud83c\uddf2\ud83c\uddf6",
    mauritania: "\ud83c\uddf2\ud83c\uddf7",
    montserrat: "\ud83c\uddf2\ud83c\uddf8",
    malta: "\ud83c\uddf2\ud83c\uddf9",
    mauritius: "\ud83c\uddf2\ud83c\uddfa",
    maldives: "\ud83c\uddf2\ud83c\uddfb",
    malawi: "\ud83c\uddf2\ud83c\uddfc",
    mexico: "\ud83c\uddf2\ud83c\uddfd",
    malaysia: "\ud83c\uddf2\ud83c\uddfe",
    mozambique: "\ud83c\uddf2\ud83c\uddff",
    namibia: "\ud83c\uddf3\ud83c\udde6",
    new_caledonia: "\ud83c\uddf3\ud83c\udde8",
    niger: "\ud83c\uddf3\ud83c\uddea",
    norfolk_island: "\ud83c\uddf3\ud83c\uddeb",
    nigeria: "\ud83c\uddf3\ud83c\uddec",
    nicaragua: "\ud83c\uddf3\ud83c\uddee",
    netherlands: "\ud83c\uddf3\ud83c\uddf1",
    norway: "\ud83c\uddf3\ud83c\uddf4",
    nepal: "\ud83c\uddf3\ud83c\uddf5",
    nauru: "\ud83c\uddf3\ud83c\uddf7",
    niue: "\ud83c\uddf3\ud83c\uddfa",
    new_zealand: "\ud83c\uddf3\ud83c\uddff",
    oman: "\ud83c\uddf4\ud83c\uddf2",
    panama: "\ud83c\uddf5\ud83c\udde6",
    peru: "\ud83c\uddf5\ud83c\uddea",
    french_polynesia: "\ud83c\uddf5\ud83c\uddeb",
    papua_new_guinea: "\ud83c\uddf5\ud83c\uddec",
    philippines: "\ud83c\uddf5\ud83c\udded",
    pakistan: "\ud83c\uddf5\ud83c\uddf0",
    poland: "\ud83c\uddf5\ud83c\uddf1",
    st_pierre_miquelon: "\ud83c\uddf5\ud83c\uddf2",
    pitcairn_islands: "\ud83c\uddf5\ud83c\uddf3",
    puerto_rico: "\ud83c\uddf5\ud83c\uddf7",
    palestinian_territories: "\ud83c\uddf5\ud83c\uddf8",
    portugal: "\ud83c\uddf5\ud83c\uddf9",
    palau: "\ud83c\uddf5\ud83c\uddfc",
    paraguay: "\ud83c\uddf5\ud83c\uddfe",
    qatar: "\ud83c\uddf6\ud83c\udde6",
    reunion: "\ud83c\uddf7\ud83c\uddea",
    romania: "\ud83c\uddf7\ud83c\uddf4",
    serbia: "\ud83c\uddf7\ud83c\uddf8",
    ru: "\ud83c\uddf7\ud83c\uddfa",
    rwanda: "\ud83c\uddf7\ud83c\uddfc",
    saudi_arabia: "\ud83c\uddf8\ud83c\udde6",
    solomon_islands: "\ud83c\uddf8\ud83c\udde7",
    seychelles: "\ud83c\uddf8\ud83c\udde8",
    sudan: "\ud83c\uddf8\ud83c\udde9",
    sweden: "\ud83c\uddf8\ud83c\uddea",
    singapore: "\ud83c\uddf8\ud83c\uddec",
    st_helena: "\ud83c\uddf8\ud83c\udded",
    slovenia: "\ud83c\uddf8\ud83c\uddee",
    svalbard_jan_mayen: "\ud83c\uddf8\ud83c\uddef",
    slovakia: "\ud83c\uddf8\ud83c\uddf0",
    sierra_leone: "\ud83c\uddf8\ud83c\uddf1",
    san_marino: "\ud83c\uddf8\ud83c\uddf2",
    senegal: "\ud83c\uddf8\ud83c\uddf3",
    somalia: "\ud83c\uddf8\ud83c\uddf4",
    suriname: "\ud83c\uddf8\ud83c\uddf7",
    south_sudan: "\ud83c\uddf8\ud83c\uddf8",
    sao_tome_principe: "\ud83c\uddf8\ud83c\uddf9",
    el_salvador: "\ud83c\uddf8\ud83c\uddfb",
    sint_maarten: "\ud83c\uddf8\ud83c\uddfd",
    syria: "\ud83c\uddf8\ud83c\uddfe",
    swaziland: "\ud83c\uddf8\ud83c\uddff",
    tristan_da_cunha: "\ud83c\uddf9\ud83c\udde6",
    turks_caicos_islands: "\ud83c\uddf9\ud83c\udde8",
    chad: "\ud83c\uddf9\ud83c\udde9",
    french_southern_territories: "\ud83c\uddf9\ud83c\uddeb",
    togo: "\ud83c\uddf9\ud83c\uddec",
    thailand: "\ud83c\uddf9\ud83c\udded",
    tajikistan: "\ud83c\uddf9\ud83c\uddef",
    tokelau: "\ud83c\uddf9\ud83c\uddf0",
    timor_leste: "\ud83c\uddf9\ud83c\uddf1",
    turkmenistan: "\ud83c\uddf9\ud83c\uddf2",
    tunisia: "\ud83c\uddf9\ud83c\uddf3",
    tonga: "\ud83c\uddf9\ud83c\uddf4",
    tr: "\ud83c\uddf9\ud83c\uddf7",
    trinidad_tobago: "\ud83c\uddf9\ud83c\uddf9",
    tuvalu: "\ud83c\uddf9\ud83c\uddfb",
    taiwan: "\ud83c\uddf9\ud83c\uddfc",
    tanzania: "\ud83c\uddf9\ud83c\uddff",
    ukraine: "\ud83c\uddfa\ud83c\udde6",
    uganda: "\ud83c\uddfa\ud83c\uddec",
    us_outlying_islands: "\ud83c\uddfa\ud83c\uddf2",
    united_nations: "\ud83c\uddfa\ud83c\uddf3",
    us: "\ud83c\uddfa\ud83c\uddf8",
    uruguay: "\ud83c\uddfa\ud83c\uddfe",
    uzbekistan: "\ud83c\uddfa\ud83c\uddff",
    vatican_city: "\ud83c\uddfb\ud83c\udde6",
    st_vincent_grenadines: "\ud83c\uddfb\ud83c\udde8",
    venezuela: "\ud83c\uddfb\ud83c\uddea",
    british_virgin_islands: "\ud83c\uddfb\ud83c\uddec",
    us_virgin_islands: "\ud83c\uddfb\ud83c\uddee",
    vietnam: "\ud83c\uddfb\ud83c\uddf3",
    vanuatu: "\ud83c\uddfb\ud83c\uddfa",
    wallis_futuna: "\ud83c\uddfc\ud83c\uddeb",
    samoa: "\ud83c\uddfc\ud83c\uddf8",
    kosovo: "\ud83c\uddfd\ud83c\uddf0",
    yemen: "\ud83c\uddfe\ud83c\uddea",
    mayotte: "\ud83c\uddfe\ud83c\uddf9",
    south_africa: "\ud83c\uddff\ud83c\udde6",
    zambia: "\ud83c\uddff\ud83c\uddf2",
    zimbabwe: "\ud83c\uddff\ud83c\uddfc",
    england: "\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc65\udb40\udc6e\udb40\udc67\udb40\udc7f",
    scotland: "\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc73\udb40\udc63\udb40\udc74\udb40\udc7f",
    wales: "\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc77\udb40\udc6c\udb40\udc73\udb40\udc7f"
};
function emoji_plugin(md, options) {
    const defaults = {
        defs: emojies_defs,
        shortcuts: emojies_shortcuts,
        enabled: []
    };
    const opts = md.utils.assign({}, defaults, options || {});
    emoji_plugin$1(md, opts);
}


// Process footnotes

/// /////////////////////////////////////////////////////////////////////////////
// Renderer partials
function render_footnote_anchor_name(tokens, idx, options, env /*, slf */) {
    const n = Number(tokens[idx].meta.id + 1).toString();
    let prefix = "";
    if (typeof env.docId === "string") prefix = `-${env.docId}-`;
    return prefix + n;
}
function render_footnote_caption(tokens, idx /*, options, env, slf */) {
    let n = Number(tokens[idx].meta.id + 1).toString();
    if (tokens[idx].meta.subId > 0) n += `:${tokens[idx].meta.subId}`;
    return `[${n}]`;
}
function render_footnote_ref(tokens, idx, options, env, slf) {
    const id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);
    const caption = slf.rules.footnote_caption(tokens, idx, options, env, slf);
    let refid = id;
    if (tokens[idx].meta.subId > 0) refid += `:${tokens[idx].meta.subId}`;
    return `<sup class="footnote-ref"><a href="#fn${id}" id="fnref${refid}">${caption}</a></sup>`;
}
function render_footnote_block_open(tokens, idx, options) {
    return (options.xhtmlOut ? '<hr class="footnotes-sep" />\n' : '<hr class="footnotes-sep">\n') + '<section class="footnotes">\n' + '<ol class="footnotes-list">\n';
}
function render_footnote_block_close() {
    return "</ol>\n</section>\n";
}
function render_footnote_open(tokens, idx, options, env, slf) {
    let id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);
    if (tokens[idx].meta.subId > 0) id += `:${tokens[idx].meta.subId}`;
    return `<li id="fn${id}" class="footnote-item">`;
}
function render_footnote_close() {
    return "</li>\n";
}
function render_footnote_anchor(tokens, idx, options, env, slf) {
    let id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);
    if (tokens[idx].meta.subId > 0) id += `:${tokens[idx].meta.subId}`
    /* ↩ with escape code to prevent display as Apple Emoji on iOS */;
    return ` <a href="#fnref${id}" class="footnote-backref">\u21a9\ufe0e</a>`;
}
function footnote_plugin(md) {
    const parseLinkLabel = md.helpers.parseLinkLabel;
    const isSpace = md.utils.isSpace;
    md.renderer.rules.footnote_ref = render_footnote_ref;
    md.renderer.rules.footnote_block_open = render_footnote_block_open;
    md.renderer.rules.footnote_block_close = render_footnote_block_close;
    md.renderer.rules.footnote_open = render_footnote_open;
    md.renderer.rules.footnote_close = render_footnote_close;
    md.renderer.rules.footnote_anchor = render_footnote_anchor;
    // helpers (only used in other rules, no tokens are attached to those)
    md.renderer.rules.footnote_caption = render_footnote_caption;
    md.renderer.rules.footnote_anchor_name = render_footnote_anchor_name;
    // Process footnote block definition
    function footnote_def(state, startLine, endLine, silent) {
        const start = state.bMarks[startLine] + state.tShift[startLine];
        const max = state.eMarks[startLine];
        // line should be at least 5 chars - "[^x]:"
        if (start + 4 > max) return false;
        if (state.src.charCodeAt(start) !== 91 /* [ */) return false;
        if (state.src.charCodeAt(start + 1) !== 94 /* ^ */) return false;
        let pos;
        for (pos = start + 2; pos < max; pos++) {
            if (state.src.charCodeAt(pos) === 32) return false;
            if (state.src.charCodeAt(pos) === 93 /* ] */) {
                break;
            }
        }
        if (pos === start + 2) return false;
        // no empty footnote labels
        if (pos + 1 >= max || state.src.charCodeAt(++pos) !== 58 /* : */) return false;
        if (silent) return true;
        pos++;
        if (!state.env.footnotes) state.env.footnotes = {};
        if (!state.env.footnotes.refs) state.env.footnotes.refs = {};
        const label = state.src.slice(start + 2, pos - 2);
        state.env.footnotes.refs[`:${label}`] = -1;
        const token_fref_o = new state.Token("footnote_reference_open", "", 1);
        token_fref_o.meta = {
            label: label
        };
        token_fref_o.level = state.level++;
        state.tokens.push(token_fref_o);
        const oldBMark = state.bMarks[startLine];
        const oldTShift = state.tShift[startLine];
        const oldSCount = state.sCount[startLine];
        const oldParentType = state.parentType;
        const posAfterColon = pos;
        const initial = state.sCount[startLine] + pos - (state.bMarks[startLine] + state.tShift[startLine]);
        let offset = initial;
        while (pos < max) {
            const ch = state.src.charCodeAt(pos);
            if (isSpace(ch)) {
                if (ch === 9) {
                    offset += 4 - offset % 4;
                } else {
                    offset++;
                }
            } else {
                break;
            }
            pos++;
        }
        state.tShift[startLine] = pos - posAfterColon;
        state.sCount[startLine] = offset - initial;
        state.bMarks[startLine] = posAfterColon;
        state.blkIndent += 4;
        state.parentType = "footnote";
        if (state.sCount[startLine] < state.blkIndent) {
            state.sCount[startLine] += state.blkIndent;
        }
        state.md.block.tokenize(state, startLine, endLine, true);
        state.parentType = oldParentType;
        state.blkIndent -= 4;
        state.tShift[startLine] = oldTShift;
        state.sCount[startLine] = oldSCount;
        state.bMarks[startLine] = oldBMark;
        const token_fref_c = new state.Token("footnote_reference_close", "", -1);
        token_fref_c.level = --state.level;
        state.tokens.push(token_fref_c);
        return true;
    }
    // Process inline footnotes (^[...])
    function footnote_inline(state, silent) {
        const max = state.posMax;
        const start = state.pos;
        if (start + 2 >= max) return false;
        if (state.src.charCodeAt(start) !== 94 /* ^ */) return false;
        if (state.src.charCodeAt(start + 1) !== 91 /* [ */) return false;
        const labelStart = start + 2;
        const labelEnd = parseLinkLabel(state, start + 1);
        // parser failed to find ']', so it's not a valid note
        if (labelEnd < 0) return false;
        // We found the end of the link, and know for a fact it's a valid link;
        // so all that's left to do is to call tokenizer.

        if (!silent) {
            if (!state.env.footnotes) state.env.footnotes = {};
            if (!state.env.footnotes.list) state.env.footnotes.list = [];
            const footnoteId = state.env.footnotes.list.length;
            const tokens = [];
            state.md.inline.parse(state.src.slice(labelStart, labelEnd), state.md, state.env, tokens);
            const token = state.push("footnote_ref", "", 0);
            token.meta = {
                id: footnoteId
            };
            state.env.footnotes.list[footnoteId] = {
                content: state.src.slice(labelStart, labelEnd),
                tokens: tokens
            };
        }
        state.pos = labelEnd + 1;
        state.posMax = max;
        return true;
    }
    // Process footnote references ([^...])
    function footnote_ref(state, silent) {
        const max = state.posMax;
        const start = state.pos;
        // should be at least 4 chars - "[^x]"
        if (start + 3 > max) return false;
        if (!state.env.footnotes || !state.env.footnotes.refs) return false;
        if (state.src.charCodeAt(start) !== 91 /* [ */) return false;
        if (state.src.charCodeAt(start + 1) !== 94 /* ^ */) return false;
        let pos;
        for (pos = start + 2; pos < max; pos++) {
            if (state.src.charCodeAt(pos) === 32) return false;
            if (state.src.charCodeAt(pos) === 10) return false;
            if (state.src.charCodeAt(pos) === 93 /* ] */) {
                break;
            }
        }
        if (pos === start + 2) return false;
        // no empty footnote labels
        if (pos >= max) return false;
        pos++;
        const label = state.src.slice(start + 2, pos - 1);
        if (typeof state.env.footnotes.refs[`:${label}`] === "undefined") return false;
        if (!silent) {
            if (!state.env.footnotes.list) state.env.footnotes.list = [];
            let footnoteId;
            if (state.env.footnotes.refs[`:${label}`] < 0) {
                footnoteId = state.env.footnotes.list.length;
                state.env.footnotes.list[footnoteId] = {
                    label: label,
                    count: 0
                };
                state.env.footnotes.refs[`:${label}`] = footnoteId;
            } else {
                footnoteId = state.env.footnotes.refs[`:${label}`];
            }
            const footnoteSubId = state.env.footnotes.list[footnoteId].count;
            state.env.footnotes.list[footnoteId].count++;
            const token = state.push("footnote_ref", "", 0);
            token.meta = {
                id: footnoteId,
                subId: footnoteSubId,
                label: label
            };
        }
        state.pos = pos;
        state.posMax = max;
        return true;
    }
    // Glue footnote tokens to end of token stream
    function footnote_tail(state) {
        let tokens;
        let current;
        let currentLabel;
        let insideRef = false;
        const refTokens = {};
        if (!state.env.footnotes) {
            return;
        }
        state.tokens = state.tokens.filter((function (tok) {
            if (tok.type === "footnote_reference_open") {
                insideRef = true;
                current = [];
                currentLabel = tok.meta.label;
                return false;
            }
            if (tok.type === "footnote_reference_close") {
                insideRef = false;
                // prepend ':' to avoid conflict with Object.prototype members
                refTokens[":" + currentLabel] = current;
                return false;
            }
            if (insideRef) {
                current.push(tok);
            }
            return !insideRef;
        }));
        if (!state.env.footnotes.list) {
            return;
        }
        const list = state.env.footnotes.list;
        state.tokens.push(new state.Token("footnote_block_open", "", 1));
        for (let i = 0, l = list.length; i < l; i++) {
            const token_fo = new state.Token("footnote_open", "", 1);
            token_fo.meta = {
                id: i,
                label: list[i].label
            };
            state.tokens.push(token_fo);
            if (list[i].tokens) {
                tokens = [];
                const token_po = new state.Token("paragraph_open", "p", 1);
                token_po.block = true;
                tokens.push(token_po);
                const token_i = new state.Token("inline", "", 0);
                token_i.children = list[i].tokens;
                token_i.content = list[i].content;
                tokens.push(token_i);
                const token_pc = new state.Token("paragraph_close", "p", -1);
                token_pc.block = true;
                tokens.push(token_pc);
            } else if (list[i].label) {
                tokens = refTokens[`:${list[i].label}`];
            }
            if (tokens) state.tokens = state.tokens.concat(tokens);
            let lastParagraph;
            if (state.tokens[state.tokens.length - 1].type === "paragraph_close") {
                lastParagraph = state.tokens.pop();
            } else {
                lastParagraph = null;
            }
            const t = list[i].count > 0 ? list[i].count : 1;
            for (let j = 0; j < t; j++) {
                const token_a = new state.Token("footnote_anchor", "", 0);
                token_a.meta = {
                    id: i,
                    subId: j,
                    label: list[i].label
                };
                state.tokens.push(token_a);
            }
            if (lastParagraph) {
                state.tokens.push(lastParagraph);
            }
            state.tokens.push(new state.Token("footnote_close", "", -1));
        }
        state.tokens.push(new state.Token("footnote_block_close", "", -1));
    }
    md.block.ruler.before("reference", "footnote_def", footnote_def, {
        alt: ["paragraph", "reference"]
    });
    md.inline.ruler.after("image", "footnote_inline", footnote_inline);
    md.inline.ruler.after("footnote_inline", "footnote_ref", footnote_ref);
    md.core.ruler.after("inline", "footnote_tail", footnote_tail);
}
function ins_plugin$1(md) {
    // Insert each marker as a separate text token, and add it to delimiter list
    function tokenize(state, silent) {
        const start = state.pos;
        const marker = state.src.charCodeAt(start);
        if (silent) {
            return false;
        }
        if (marker !== 43 /* + */) {
            return false;
        }
        const scanned = state.scanDelims(state.pos, true);
        let len = scanned.length;
        const ch = String.fromCharCode(marker);
        if (len < 2) {
            return false;
        }
        if (len % 2) {
            const token = state.push("text", "", 0);
            token.content = ch;
            len--;
        }
        for (let i = 0; i < len; i += 2) {
            const token = state.push("text", "", 0);
            token.content = ch + ch;
            if (!scanned.can_open && !scanned.can_close) {
                continue;
            }
            state.delimiters.push({
                marker: marker,
                length: 0,
                // disable "rule of 3" length checks meant for emphasis
                jump: i / 2,
                // 1 delimiter = 2 characters
                token: state.tokens.length - 1,
                end: -1,
                open: scanned.can_open,
                close: scanned.can_close
            });
        }
        state.pos += scanned.length;
        return true;
    }
    // Walk through delimiter list and replace text tokens with tags

    function postProcess(state, delimiters) {
        let token;
        const loneMarkers = [];
        const max = delimiters.length;
        for (let i = 0; i < max; i++) {
            const startDelim = delimiters[i];
            if (startDelim.marker !== 43 /* + */) {
                continue;
            }
            if (startDelim.end === -1) {
                continue;
            }
            const endDelim = delimiters[startDelim.end];
            token = state.tokens[startDelim.token];
            token.type = "ins_open";
            token.tag = "ins";
            token.nesting = 1;
            token.markup = "++";
            token.content = "";
            token = state.tokens[endDelim.token];
            token.type = "ins_close";
            token.tag = "ins";
            token.nesting = -1;
            token.markup = "++";
            token.content = "";
            if (state.tokens[endDelim.token - 1].type === "text" && state.tokens[endDelim.token - 1].content === "+") {
                loneMarkers.push(endDelim.token - 1);
            }
        }
        // If a marker sequence has an odd number of characters, it's splitted
        // like this: `~~~~~` -> `~` + `~~` + `~~`, leaving one marker at the
        // start of the sequence.

        // So, we have to move all those markers after subsequent s_close tags.

        while (loneMarkers.length) {
            const i = loneMarkers.pop();
            let j = i + 1;
            while (j < state.tokens.length && state.tokens[j].type === "ins_close") {
                j++;
            }
            j--;
            if (i !== j) {
                token = state.tokens[j];
                state.tokens[j] = state.tokens[i];
                state.tokens[i] = token;
            }
        }
    }
    md.inline.ruler.before("emphasis", "ins", tokenize);
    md.inline.ruler2.before("emphasis", "ins", (function (state) {
        const tokens_meta = state.tokens_meta;
        const max = (state.tokens_meta || []).length;
        postProcess(state, state.delimiters);
        for (let curr = 0; curr < max; curr++) {
            if (tokens_meta[curr] && tokens_meta[curr].delimiters) {
                postProcess(state, tokens_meta[curr].delimiters);
            }
        }
    }));
}
function ins_plugin(md) {
    // Insert each marker as a separate text token, and add it to delimiter list
    function tokenize(state, silent) {
        const start = state.pos;
        const marker = state.src.charCodeAt(start);
        if (silent) {
            return false;
        }
        if (marker !== 61 /* = */) {
            return false;
        }
        const scanned = state.scanDelims(state.pos, true);
        let len = scanned.length;
        const ch = String.fromCharCode(marker);
        if (len < 2) {
            return false;
        }
        if (len % 2) {
            const token = state.push("text", "", 0);
            token.content = ch;
            len--;
        }
        for (let i = 0; i < len; i += 2) {
            const token = state.push("text", "", 0);
            token.content = ch + ch;
            if (!scanned.can_open && !scanned.can_close) {
                continue;
            }
            state.delimiters.push({
                marker: marker,
                length: 0,
                // disable "rule of 3" length checks meant for emphasis
                jump: i / 2,
                // 1 delimiter = 2 characters
                token: state.tokens.length - 1,
                end: -1,
                open: scanned.can_open,
                close: scanned.can_close
            });
        }
        state.pos += scanned.length;
        return true;
    }
    // Walk through delimiter list and replace text tokens with tags

    function postProcess(state, delimiters) {
        const loneMarkers = [];
        const max = delimiters.length;
        for (let i = 0; i < max; i++) {
            const startDelim = delimiters[i];
            if (startDelim.marker !== 61 /* = */) {
                continue;
            }
            if (startDelim.end === -1) {
                continue;
            }
            const endDelim = delimiters[startDelim.end];
            const token_o = state.tokens[startDelim.token];
            token_o.type = "mark_open";
            token_o.tag = "mark";
            token_o.nesting = 1;
            token_o.markup = "==";
            token_o.content = "";
            const token_c = state.tokens[endDelim.token];
            token_c.type = "mark_close";
            token_c.tag = "mark";
            token_c.nesting = -1;
            token_c.markup = "==";
            token_c.content = "";
            if (state.tokens[endDelim.token - 1].type === "text" && state.tokens[endDelim.token - 1].content === "=") {
                loneMarkers.push(endDelim.token - 1);
            }
        }
        // If a marker sequence has an odd number of characters, it's splitted
        // like this: `~~~~~` -> `~` + `~~` + `~~`, leaving one marker at the
        // start of the sequence.

        // So, we have to move all those markers after subsequent s_close tags.

        while (loneMarkers.length) {
            const i = loneMarkers.pop();
            let j = i + 1;
            while (j < state.tokens.length && state.tokens[j].type === "mark_close") {
                j++;
            }
            j--;
            if (i !== j) {
                const token = state.tokens[j];
                state.tokens[j] = state.tokens[i];
                state.tokens[i] = token;
            }
        }
    }
    md.inline.ruler.before("emphasis", "mark", tokenize);
    md.inline.ruler2.before("emphasis", "mark", (function (state) {
        let curr;
        const tokens_meta = state.tokens_meta;
        const max = (state.tokens_meta || []).length;
        postProcess(state, state.delimiters);
        for (curr = 0; curr < max; curr++) {
            if (tokens_meta[curr] && tokens_meta[curr].delimiters) {
                postProcess(state, tokens_meta[curr].delimiters);
            }
        }
    }));
}

// Process ~subscript~
// same as UNESCAPE_MD_RE plus a space
const UNESCAPE_RE$1 = /\\([ \\!"#$%&'()*+,./:;<=>?@[\]^_`{|}~-])/g;

function subscript(state, silent) {
    const max = state.posMax;
    const start = state.pos;
    if (state.src.charCodeAt(start) !== 126 /* ~ */) {
        return false;
    }
    if (silent) {
        return false;
    }
    // don't run any pairs in validation mode
    if (start + 2 >= max) {
        return false;
    }
    state.pos = start + 1;
    let found = false;
    while (state.pos < max) {
        if (state.src.charCodeAt(state.pos) === 126 /* ~ */) {
            found = true;
            break;
        }
        state.md.inline.skipToken(state);
    }
    if (!found || start + 1 === state.pos) {
        state.pos = start;
        return false;
    }
    const content = state.src.slice(start + 1, state.pos);
    // don't allow unescaped spaces/newlines inside
    if (content.match(/(^|[^\\])(\\\\)*\s/)) {
        state.pos = start;
        return false;
    }
    // found!
    state.posMax = state.pos;
    state.pos = start + 1;
    // Earlier we checked !silent, but this implementation does not need it
    const token_so = state.push("sub_open", "sub", 1);
    token_so.markup = "~";
    const token_t = state.push("text", "", 0);
    token_t.content = content.replace(UNESCAPE_RE$1, "$1");
    const token_sc = state.push("sub_close", "sub", -1);
    token_sc.markup = "~";
    state.pos = state.posMax + 1;
    state.posMax = max;
    return true;
}
function sub_plugin(md) {
    md.inline.ruler.after("emphasis", "sub", subscript);
}
// Process ^superscript^
// same as UNESCAPE_MD_RE plus a space
const UNESCAPE_RE = /\\([ \\!"#$%&'()*+,./:;<=>?@[\]^_`{|}~-])/g;
function superscript(state, silent) {
    const max = state.posMax;
    const start = state.pos;
    if (state.src.charCodeAt(start) !== 94 /* ^ */) {
        return false;
    }
    if (silent) {
        return false;
    }
    // don't run any pairs in validation mode
    if (start + 2 >= max) {
        return false;
    }
    state.pos = start + 1;
    let found = false;
    while (state.pos < max) {
        if (state.src.charCodeAt(state.pos) === 94 /* ^ */) {
            found = true;
            break;
        }
        state.md.inline.skipToken(state);
    }
    if (!found || start + 1 === state.pos) {
        state.pos = start;
        return false;
    }
    const content = state.src.slice(start + 1, state.pos);
    // don't allow unescaped spaces/newlines inside
    if (content.match(/(^|[^\\])(\\\\)*\s/)) {
        state.pos = start;
        return false;
    }
    // found!
    state.posMax = state.pos;
    state.pos = start + 1;
    // Earlier we checked !silent, but this implementation does not need it
    const token_so = state.push("sup_open", "sup", 1);
    token_so.markup = "^";
    const token_t = state.push("text", "", 0);
    token_t.content = content.replace(UNESCAPE_RE, "$1");
    const token_sc = state.push("sup_close", "sup", -1);
    token_sc.markup = "^";
    state.pos = state.posMax + 1;
    state.posMax = max;
    return true;
}

function sup_plugin(md) {
    md.inline.ruler.after("emphasis", "sup", superscript);
}

// ==============================

const React = require('react');

const hljs = require('highlight.js'); // 语法解析库
const twemoji = require('twemoji').default; // Twitter表情解析库

// scss
require('highlight.js/scss/default.scss');
require('highlight.js/scss/github.scss');
require('./code.scss');
require('./bootstrap.scss');

const MarkdownIt = require('markdown-it');
const Buffer = require('buffer/').Buffer; // 注意这里的路径可能因版本而异，请参考你安装的版本的文档

const mdHtml = new MarkdownIt({
    // Enable HTML tags in source
    html: true,

    // Use '/' to close single tags (<br />).
    // This is only for full CommonMark compatibility.
    xhtmlOut: true,
    // Convert '\n' in paragraphs into <br>
    breaks: true,
    // CSS language prefix for fenced blocks. Can be
    // useful for external highlighters.
    langPrefix: 'language-',

    // Autoconvert URL-like text to links
    linkify: true,

    // Enable some language-neutral replacement + quotes beautification
    // For the full list of replacements, see https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/replacements.mjs
    typographer: true,

    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Could be either a String or an Array.
    //
    // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
    // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
    quotes: '“”‘’',
    // Highlighter function. Should return escaped HTML,
    // or '' if the source string is not changed and should be escaped externally.
    // If result starts with <pre... internal wrapper is skipped.
    highlight: function (str, lang) {
        const esc = mdHtml.utils.escapeHtml;
        try {
            if (lang && lang !== "auto" && hljs.getLanguage(lang)) {
                return '<pre class="hljs language-' + esc(lang.toLowerCase()) + '"><code>' + hljs.highlight(str, {
                    language: lang,
                    ignoreIllegals: true
                }).value + "</code></pre>";
            } else if (lang === "auto") {
                const result = hljs.highlightAuto(str);
        /* eslint-disable no-console */        console.log("highlight language: " + result.language + ", relevance: " + result.relevance);
                return '<pre class="hljs language-' + esc(result.language) + '"><code>' + result.value + "</code></pre>";
            }
        } catch (__) { }
        return '<pre><code class="hljs">' + esc(str) + "</code></pre>";
    }
}).use(deflist_plugin).use(emoji_plugin).use(footnote_plugin).use(ins_plugin$1).use(ins_plugin).use(sub_plugin).use(sup_plugin);

// Beautify output of parser for html content
mdHtml.renderer.rules.table_open = function () {
    return '<table class="table table-striped">\n';
};

// Replace emoji codes with images
//mdHtml.renderer.rules.emoji = function (token, idx) {
//    const data = twemoji.parse(token[idx].content);
//    console.log(token, idx, data);
//    return data;
//};

function decodeBase64MarkdownUrl(dataUrl) {
    console.log([dataUrl]);
    // 确保dataUrl是有效的  
    if (!dataUrl || !dataUrl.startsWith('data:text/markdown;base64,') && !dataUrl.startsWith('data:text/markdown;charset=utf-8;base64,')) {
        throw new Error('Invalid data URL');
    }

    // 提取Base64编码的字符串  
    const base64String = dataUrl.split(',')[1];

    // 使用Buffer来解码  
    let decodedString = Buffer.from(base64String, 'base64').toString('utf-8');

    // 返回解码后的Markdown文本  
    return decodedString;
}

function Markdown(props) {
    const { children, getContent, base64Url, className, ...rest } = props;
    const data = (getContent ? getContent(children) : children);
    return (
        <div dangerouslySetInnerHTML={{ __html: mdHtml.render((base64Url ? decodeBase64MarkdownUrl(data) : data)) }} {...rest} className={"markdown "+className}></div>
    );
}

function MarkdownDownLoader(props) {
    const { children, text, ...obj } = props;
    return (<a href={URL.createObjectURL(new Blob([decodeBase64MarkdownUrl(children)]))} download="Scratch扩展开发指南.md">{text}</a>);
}

export {
    Markdown as default,
    MarkdownDownLoader
}
