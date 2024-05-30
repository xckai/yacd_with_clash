const https = require('https'); // or 'https' for https:// URLs
const { exec } = require('node:child_process');
const path = require('node:path');
const fs = require('fs');
const dayjs = require('dayjs');
const server = require('./server');
const sub_url = process.env['SUB_URL'];
const configFilePath = '/root/.config/clash/config.yaml';
function checkClashConfigFile() {
  return fs.existsSync(configFilePath);
}
function restartClash() {
  if (clashProcess) {
    clashProcess.kill();
    clashProcess = undefined;
  }
  setTimeout(function () {
    clashProcess = exec('/clash');
    loggerInfo('Clash restarted');
  }, 100);
}
function loggerInfo(str) {
  let timeStr = dayjs().format('YYYY-MM-DD HH:mm:ss');
  console.log(`${timeStr} : ${str}`);
}
function downConfigAndRestart() {
  loggerInfo('Updating config file');
  const tempFile = path.resolve(configFilePath, '../config_temp.yaml');
  const file = fs.createWriteStream(tempFile);
  https.get(sub_url, (resp) => {
    resp.pipe(file);
    file.on('finish', async function () {
      file.close(() => {
        exec(`mv ${tempFile} ${path.resolve(tempFile, '../config.yaml')}`, () => {
          loggerInfo('Config file update success!');
          restartClash();
        });
      });
    });
  });
}
function scheduleIntervalUpdate() {
  let env = process.env['INTERVAL_UPDATE_MINUTE'];
  if (env) {
    let value = parseInt(env, 10);
    if (value > 0) {
      loggerInfo(`Interval update config: ${value} minutes`);
      setInterval(downConfigAndRestart, value * 60 * 1000);
    }
  }
}
let clashProcess;
(function run() {
  const args = process.argv.slice(2);
  const command = args[0].toLocaleLowerCase();
  exec('exec nginx -g "daemon off;"', function (err) {
    if (err) {
      console.error(err);
    }
  });
  server.startServer();
  scheduleIntervalUpdate();
  downConfigAndRestart();
  // switch (command) {
  //   case 'run':
  //     downConfigAndRestart();
  //     break;
  //   case 'update':
  //     downConfigAndRestart();
  //     break;
  //   default:
  //     console.error('Unknown command: ' + command);
  // }
})();
