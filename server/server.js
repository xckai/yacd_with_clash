const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const HOST = process.env['HOST'] || '0.0.0.0';
const PORT = process.env['PORT'] || 8080;

const CLASH_EXTERNAL_CONTROLLER =
  process.env['CLASH_EXTERNAL_CONTROLLER'] || 'http://127.0.0.1:9090/';


const app = express();
app.use(
  ['/internal-clash*', '/internal-clash', '/internal-clash/**/*'],
  createProxyMiddleware({
    target: CLASH_EXTERNAL_CONTROLLER,
    changeOrigin: true,
    ws: true,
    pathRewrite: function (path, req) {
      return path.replace('/internal-clash', '');
    },
  })
);

app.all(['/', '/*'], createProxyMiddleware({
  target: "http://localhost:80/"
}));

module.exports = {
  startServer: () => {
    app.listen(PORT, HOST, () => {
      console.log(`Server start at ${HOST}:${PORT}`);
    });
  },
};
