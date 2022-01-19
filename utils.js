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
     * Get the value of an arg provided through the CLI
     * 
     * @param {String|String[]} optionKeys - Option keys to search for
     * @param {Boolean} caseSensitive - `true` by default
     * @returns {{ isFound: Boolean, valueFound: String }} `{ optionFound: Boolean, valueFound: String }`
     */
    findCLIArgValue: (optionKeys, caseSensitive = true) => {
        const optionsSearched = Array.isArray(optionKeys) ? (caseSensitive ? optionKeys : optionKeys.map(o => o.toLowerCase)) : [caseSensitive ? optionKeys : optionKeys.toLowerCase()];
        let optionsFound = (caseSensitive ? process.argv : process.argv.map(
            e => e.toLowerCase()
        )).filter(
            str => optionsSearched.filter(o => str.startsWith(o)).length > 0
        );
        if (optionsFound.length == 0) return { isFound: false, valueFound: undefined };
        if (optionsFound.length > 1)
            throw new Error(
                "Multiple CLI variants of the same arg found : " + optionsFound.join(', ')
            );
        return {
            isFound: true,
            valueFound: optionsFound[0].replaceAll(
                new RegExp(`(${optionsSearched.find(o => optionsFound[0].startsWith(o))}=?)|['"]`, 'gi'), ''
            )
        };
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
    createDir: (dirPath, options) => {
        const { recreateIfFound, verbose } = options;
        if (recreateIfFound && fs.existsSync(dirPath)) {
            try {
                fs.rmSync(dirPath, { recursive: true });
            } catch (error) {
                console.error(colors.red, 'error', `current path : ${__dirname}, attempt at deleting : ${dirPath}`);
                throw error;
            }
        }
        if (!fs.existsSync(dirPath)) {
            try {
                fs.mkdirSync(dirPath);
                if (verbose)
                    console.log(
                        recreateIfFound ? colors.yellow : colors.green,
                        (recreateIfFound ? 're' : '') + 'create', dirPath
                    );
            } catch (error) {
                console.error(colors.red, 'error', `current path : ${__dirname}, attempt at creating : ${dirPath}`);
                throw error;
            }
        } else if (verbose) {
            console.log(colors.blue, 'found', dirPath);
        }
    },
    createFile: (filePath, fileContent, options) => {
        const { recreateIfFound, verbose } = options;
        if (!fs.existsSync(filePath) || recreateIfFound) {
            try {
                fs.writeFileSync(filePath, fileContent);
                if (verbose)
                    console.log(
                        recreateIfFound ? colors.yellow : colors.green,
                        (recreateIfFound ? 're' : '') + 'create', filePath
                    );
            } catch (error) {
                console.error(colors.red, 'error', `current path : ${__dirname}, attempt at creating : ${filePath}`);
                throw error;
            }
        } else if (verbose) {
            console.log(colors.blue, 'found', filePath);
        }
    },
}