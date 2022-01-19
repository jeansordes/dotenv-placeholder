const { findCLIArgValue, createFile, createDir } = require('../utils');

const createTestFiles = (recreateFiles = false) => {
    const fs = require('fs'),
        configPath = __dirname + '/config',
        envPath = configPath + '/.env',
        plhlPath = configPath + '/.plhl.env',
        fileDirCreationOptions = {
            recreateIfFound: recreateFiles,
            verbose: process.env.VERBOSE || findCLIArgValue(['-v', '--verbose']).isFound,
        };

    createDir(configPath, fileDirCreationOptions);
    createFile(envPath, "# .env\n" + "KEY=secret_value\n", fileDirCreationOptions);
    createFile(plhlPath,
        "# .placeholder.env\n"
        + "ADDITIONAL_KEY=\n"
        + "KEY_WITH_DEFAULT=default_value\n"
        + "A_RANDOM_KEY=<random>\n", fileDirCreationOptions);
}

createTestFiles(findCLIArgValue('--recreate-files').isFound);

if (!findCLIArgValue('--no-build').isFound) {
    require('../index').config({ path: './tests/config/.env' });
}