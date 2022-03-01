const dotenv = require('dotenv'),
    fs = require('fs'),
    pathLib = require('path'),
    { yellow, blue } = require('./utils').colors;
const { randomString, getFileData, createFile, findCLIArgValue } = require('./utils');

const get_plhl_path = (envPath, additional_plhl_path) => {
    const plhlPaths = [
        additional_plhl_path,
        '.plhl.env',
        '.placeholder.env',
        '.env.plhl',
        '.env.placeholder',
    ], envDir = pathLib.dirname(envPath) + '/';
    return envDir + (plhlPaths.find(path => fs.existsSync(envDir + path)) || plhlPaths[1]);
}

const json2string = json => (Object.keys(json).map(key => key + '=' + json[key]).join('\n') || '');

const parse_plhl2env_value = value => {
    // if .env key == '' and .placeholder.env key == '<random:x>' || '<random>' then .env key = random with length of x
    const res = value.match(/^\<random(:([0-9]+))?\>$/);
    return res === null ? value : (
        res[2] === undefined ? randomString() : randomString(Number.parseInt(res[2]))
    );
}

const build = (args) => {
    // create files if not found
    const envPath = args && args.path ? args.path : '.env';
    const plhlPath = args && args.placeholderPath ? get_plhl_path(envPath, args.placeholderPath) : get_plhl_path(envPath);
    const verbose = process.env.VERBOSE || findCLIArgValue(['-v', '--verbose']).isFound;
    const fileCreationOptions = {
        recreateIfFound: false,
        verbose: verbose,
    };
    createFile(envPath, '', fileCreationOptions);
    createFile(plhlPath, '', fileCreationOptions);

    const envFilename = pathLib.basename(envPath),
        plhlFilename = pathLib.basename(plhlPath);

    // keys found in .placeholder.env and not in .env ? added to .env
    let [plhlTXT, plhlJSON, plhlKeys] = getFileData(plhlPath),
        [envTXT, envJSON, envKeys] = getFileData(envPath),
        json2add = {},
        json2replace = {};
    for (let i = 0; i < plhlKeys.length; i++) {
        if (!envKeys.includes(plhlKeys[i])) {
            json2add[plhlKeys[i]] = parse_plhl2env_value(plhlJSON[plhlKeys[i]]);
        } else if (envKeys.includes(plhlKeys[i])
            && envJSON[plhlKeys[i]].trim() == ''
            && plhlJSON[plhlKeys[i]].trim() != '') {
            json2replace[plhlKeys[i]] = parse_plhl2env_value(plhlJSON[plhlKeys[i]]);
        }
    }
    envTXT = getFileData(envPath)[0];
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
        if (verbose) console.log(blue, 'info', `${plhlFilename} → ${envFilename} : `, [...keys2replace, ...Object.keys(json2add)]);
    }

    // keys found in .env and not in .placeholder.env ? added to .placeholder.env (without the values)
    [envTXT, envJSON, envKeys] = getFileData(envPath);
    json2add = {};
    for (let i = 0; i < envKeys.length; i++) {
        if (!plhlKeys.includes(envKeys[i])) {
            json2add[envKeys[i]] = '';
        }
    }
    if (Object.keys(json2add).length > 0) {
        fs.appendFileSync(plhlPath, (plhlTXT.trim() == '' ? '' : '\n') + json2string(json2add));
        if (verbose) console.log(blue, 'info', `${plhlFilename} ← ${envFilename} : `, Object.keys(json2add));
    }

    // check if there is empty keys in .env
    let envEmptyKeys = envKeys.filter(key => envJSON[key].trim() == '');
    if (envEmptyKeys.length > 0) {
        console.log(yellow, 'warning', `empty keys found in ${envFilename} :`, envEmptyKeys);
    }
}

module.exports = {
    ...dotenv, config: (...args) => {
        build(...args);
        return dotenv.config(...args);
    }
};