const path = require('path');

// We get the path of the entry point file which started the application. Because this file is at the root, thus we get the the path to the root location
module.exports = path.dirname(process.mainModule.filename);

// dirname: get the directory name for a filename
// process: global variable available
// mainModule: refer to the main module (file) which started the application (app.js) = entry point
