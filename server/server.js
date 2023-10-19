const express = require("express");
const proxy = require("express-http-proxy");
const HOST = process.env["HOST"] || "0.0.0.0";
const PORT = process.env["PORT"] || 8080;
const CLASH_EXTERNAL_CONTROLLER= process.env["CLASH_EXTERNAL_CONTROLLER"] || "http://127.0.0.1:9090/";
const app = express();
app.all("/internal-clash/*", proxy(CLASH_EXTERNAL_CONTROLLER, {
  proxyReqPathResolver: function (req) {
    const reqUrl =req.url;
    return reqUrl.replace("/internal-clash","")
  }
}))
app.all("/internal-clash", proxy(CLASH_EXTERNAL_CONTROLLER, {
  proxyReqPathResolver: function (req) {
    const reqUrl =req.url;
    return reqUrl.replace("/internal-clash","")
  }
}))
app.all("/", proxy("http://localhost:80/"));
app.all("/*", proxy("http://localhost:80/"));


module.exports ={
  startServer:()=>{
    app.listen(PORT,HOST,()=>{
      console.log(`Server start at ${HOST}:${PORT}`);
    })
  }
}