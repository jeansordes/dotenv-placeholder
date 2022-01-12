const { colors, findCLIArgValue, createFile } = require('../utils');
const { green, blue } = colors;

const createTestFiles = (recreateFiles = false) => {
    const fs = require('fs'),
        configPath = __dirname + '/config',
        envPath = configPath + '/.env',
        plhlPath = configPath + '/.plhl.env';

    if (!fs.existsSync(configPath)) {
        console.log(green, 'created', configPath);
        fs.mkdirSync(configPath);
    } else {
        console.log(blue, 'found', configPath);
    }

    createFile(envPath, "# .env\n" + "KEY=secret_value\n", { recreateIfFound: recreateFiles, verbose: false });
    
    createFile(plhlPath,
        "# .placeholder.env\n"
        + "ADDITIONAL_KEY=\n"
        + "KEY_WITH_DEFAULT=default_value\n"
        + "A_RANDOM_KEY=<random>\n", { recreateIfFound: recreateFiles, verbose: false });
}

createTestFiles(findCLIArgValue('--recreate-files'));

if (!findCLIArgValue('--no-build')) {
    require('../index').config({ path: './tests/config/.env' });
}