const process = require('process');
const chalk = require('chalk');
const readline = require('readline');
const fs = require('fs');

const log = (msg, isUpdateLastLine = false) => {
  if (isUpdateLastLine) {
    if (process.stdout.clearLine) {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
    } else {
      readline.cursorTo(process.stdout, 0);
    }
  } else {
    process.stdout.write('\n');
  }
  process.stdout.write(msg + '                                   ');
};

const logComponent = (params) => {
  const defaultParams = { componentName: '', level: 1, status: 'INIT' };
  const { componentName, level, status } = Object.assign(defaultParams, params);

  const wrapper = {
    prefix: ':: ',
    marker: (code) => {
      switch (code) {
        case 'INIT':
          return '[※]';

        case 'SUCCESS':
        case 'OK':
        case 'DONE':
          return `[${chalk['green']('✔')}]`;

        case 'FAIL':
        case 'FAILED':
        case 'ERROR':
          return `[${chalk['red']('✖')}]`;

        case 'SKIP':
        case 'IGNORE':
        case 'SKIPPED':
          return `[${chalk['red']('skip')}]`;

        default:
          return `[${chalk['yellow']('?')}]`;
      }
    },
  };

  for (let i = 1; i < level; i += 1) {
    wrapper.prefix = `${wrapper.prefix}    `;
  }

  log(`${wrapper.prefix}${wrapper.marker(status)} ${componentName}`, status !== 'INIT');
};

const logComponentAppend = (params) => {
  process.stdout.write(params.componentName);
};

const promiseWrapper = (nofy, fn, params, isSkipped = false) => {
  const { name } = fn;
  logComponent({ componentName: name, status: 'INIT' });

  if (isSkipped) {
    logComponent({ componentName: name, status: 'SKIPPED' });
    return true;
  }
  return new Promise((resolve, reject) => {
    const cb = (result, err) => {
      if (err) {
        logComponent({ componentName: name, status: 'FAILED' });
        // console.log('')
        return reject(err);
      }
      logComponent({ componentName: name, status: 'SUCCESS' });
      return resolve(true);
    };

    fn(nofy, params, cb);
  });
};

const getFilesInPath = (folderPath) => {
  return fs.readdirSync(folderPath)
    .filter(file => !!(file.endsWith('.js') && file !== 'index.js' && file !== 'core.js'))
    .map((file) => {
      return {
        file,
        folderPath,
        fullpath: `${folderPath}/${file}`
      };
    });
};

module.exports = {
  log,
  logComponent,
  logComponentAppend,
  promiseWrapper,
  getFilesInPath
};
