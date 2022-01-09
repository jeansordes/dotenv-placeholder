const dotenv = require('dotenv'),
    fs = require('fs');

const createIfNotFound = file => {
    if (typeof file == 'string') {
        if (!fs.existsSync(file)) fs.writeFileSync(file, '');
    } else {
        if (!fs.existsSync(file.path)) fs.writeFileSync(file.path, file.content);
    }
};

const yellow = '\x1b[33m%s\x1b[0m',
    blue = '\x1b[34m%s\x1b[0m';

const json2string = json => (Object.keys(json).map(key => key + '=' + json[key]).join('\n') || '');

const getData = path => {
    const txt = fs.readFileSync(path) + '',
        json = dotenv.parse(txt);
    return [txt, json, Object.keys(json)];
};

const build = (args) => {
    // create files if not found
    const envPath = args && args.path ? args.path : envPath;
    const envP_Path = envPath + '.placeholder';
    createIfNotFound(envPath);
    createIfNotFound(envP_Path);

    // keys found in .env.placeholder and not in .env ? added to .env
    let [plhlTXT, plhlJSON, plhlKeys] = getData(envP_Path),
        [envTXT, envJSON, envKeys] = getData(envPath),
        json2add = {},
        json2replace = {};
    for (let i = 0; i < plhlKeys.length; i++) {
        if (!envKeys.includes(plhlKeys[i])) {
            json2add[plhlKeys[i]] = plhlJSON[plhlKeys[i]];
        } else if (envKeys.includes(plhlKeys[i])
            && envJSON[plhlKeys[i]].trim() == ''
            && plhlJSON[plhlKeys[i]].trim() != '') {
            json2replace[plhlKeys[i]] = plhlJSON[plhlKeys[i]];
        }
    }
    const keys2replace = Object.keys(json2replace);
    if ((Object.keys(json2add).length + keys2replace.length) > 0) {
        let output = envTXT.split('\n').map(line => {
            if (line.startsWith('#') || !keys2replace.includes(line.split('=')[0])) {
                return line;
            } else {
                const key = line.split('=')[0];
                return key + '=' + json2replace[key];
            }
        }).join('\n');
        fs.writeFileSync(envPath, output + ((output.trim() == '' || Object.keys(json2add).length == 0) ? '' : '\n') + json2string(json2add));
        console.log(blue, 'info', '.env.placeholder → .env : ', [...keys2replace, ...Object.keys(json2add)]);
    }

    // keys found in .env and not in .env.placeholder ? added to .env.placeholder (without the values)
    [envTXT, envJSON, envKeys] = getData(envPath);
    json2add = {};
    for (let i = 0; i < envKeys.length; i++) {
        if (!plhlKeys.includes(envKeys[i])) {
            json2add[envKeys[i]] = '';
        }
    }
    if (Object.keys(json2add).length > 0) {
        fs.appendFileSync(envP_Path, (plhlTXT.trim() == '' ? '' : '\n') + json2string(json2add));
        console.log(blue, 'info', '.env.placeholder ← .env : ', Object.keys(json2add));
    }

    // check if there is empty keys in .env
    let envEmptyKeys = envKeys.filter(key => envJSON[key].trim() == '');
    if (envEmptyKeys.length > 0) {
        console.log(yellow, 'warning', 'empty keys found in .env :', envEmptyKeys);
    }
}

module.exports = {
    ...dotenv, config: (...args) => {
        build(...args);
        return dotenv.config(...args);
    }
};