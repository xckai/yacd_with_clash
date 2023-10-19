
const https = require('https'); // or 'https' for https:// URLs
const { fork, exec } = require('node:child_process');
const path = require('node:path');
const fs = require('fs');
const server = require("./server")
const sub_url = process.env['SUB_URL'];
function checkClashConfigFile() {
  return fs.existsSync('/root/.config/clash/config.yaml');
}
function restartAll() {
  process.exit(-2);
}
function downConfigAndRestart() {
  const tempFile= path.resolve("/root/.config/clash/","config_temp.yaml")
  const file = fs.createWriteStream(tempFile);
  https.get(sub_url, (resp) => {
    resp.pipe(file);
    file.on('finish', async function () {
      file.close(() => {
       exec(`mv ${tempFile} ${path.resolve(tempFile,"../config.yaml")}`,()=>{
        console.log("config file update success!")
        restartAll();
       });
      });
    });
  });
}
(function run() {
  const args = process.argv.slice(2);
  const currentFile = process.argv[1];
  const command = args[0].toLocaleLowerCase();
  switch (command) {
    case 'run':
      if (checkClashConfigFile()) {
        exec('/clash');
        exec('exec nginx -g "daemon off;"')
        server.startServer();
        return;
      } else {
        downConfigAndRestart();
      }
      break;
    case 'update':
      downConfigAndRestart();
      break;
    default:
      console.error('Unknown command: ' + command);
  }
})();
