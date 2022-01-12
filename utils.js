const fs = require('fs'),
    { randomBytes } = require("crypto"),
    dotenv = require('dotenv');

const colors = {
    red: '\x1b[31m%s\x1b[0m',
    green: '\x1b[32m%s\x1b[0m',
    yellow: '\x1b[33m%s\x1b[0m',
    blue: '\x1b[34m%s\x1b[0m',
};

module.exports = {
    colors,
    /**
     * Get the value of an arg
     * @param {string} key to search for
     * @returns false (not found) | true (found, but no value) | string (value found)
     */
    findCLIArgValue: (option) => {
        const option2lowerCase = option.toLowerCase();
        let optionFound = process.argv.find(str => str.toLowerCase().startsWith(option2lowerCase)),
            valueFound = optionFound === undefined ? false : optionFound.toLowerCase().replaceAll(new RegExp(`(${option2lowerCase}=?)|['"]`, 'gi'), '');
        return valueFound === '' ? true : valueFound;
    },
    getFileData: (path) => {
        const txt = fs.readFileSync(path) + '',
            json = dotenv.parse(txt);
        return [txt, json, Object.keys(json)];
    },
    randomString: (length = 30) => {
        // Roughly equivalent to shell `openssl rand -base64 30 | tr '+/' '-_'`
        return randomBytes(length)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_");
    },
    createFile: (filePath, fileContent, options) => {
        const { recreateIfFound, verbose } = options;
        if (!fs.existsSync(filePath) || recreateIfFound) {
            try {
                fs.writeFileSync(filePath, fileContent);
                if (verbose) console.log(colors.green, 'create', filePath);
            } catch (error) {
                console.error(colors.red, 'error', `current path : ${__dirname}, attempt at creating : ${filePath}`);
                throw error;
            }
        } else {
            if (verbose) console.log(colors.blue, 'found', filePath);
        }
    },
}