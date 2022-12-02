/*
 * proxy.js
 * The bandwidth hero proxy handler.
 * proxy(httpRequest, httpResponse);
 */
const get = require("miniget");
const pick = require("lodash").pick;
const shouldCompress = require("./shouldCompress");
const redirect = require("./redirect");
const compress = require("./compress");
const copyHeaders = require("./copyHeaders");

function proxy(req, res) {
  /*
   * Avoid loopback that could causing server hang.
   */
  if (
    req.headers["via"] == "1.1 bandwidth-hero" &&
    ["127.0.0.1", "::1"].includes(req.headers["x-forwarded-for"] || req.ip)
  )
    return redirect(req, res);
  let origin = get(req.params.url, {
    headers: {
      ...pick(req.headers, ["cookie", "dnt", "referer"]),
      "user-agent": "Bandwidth-Hero Compressor",
      "x-forwarded-for": req.headers["x-forwarded-for"] || req.ip,
      via: "1.1 bandwidth-hero",
    },
    timeout: 10000,
    maxRedirects: 5,
    encoding: null,
    strictSSL: false,
    gzip: true,
    jar: true,
  });

  /*
   * When there's a error, Redirect then destroy the stream immediately.
   */

  origin.on("error", () => {
    redirect(req, res);
    return origin.destroy();
  });

  origin.on("response", (response) => {
    if (res.statusCode >= 400) {
      redirect(req, res);
      return origin.destroy();
    }

    copyHeaders(response, res);
    res.setHeader("content-encoding", "identity");
    req.params.originType = response.headers["content-type"] || "";
    req.params.originSize = response.headers["content-length"] || "0";

    if (shouldCompress(req)) {
      /*
       * sharp support stream. So pipe it.
       */
      return compress(req, res, origin, headers);
    } else {
      /*
       * Downloading then uploading the buffer to the client is not a good idea though,
       * It would better if you pipe the incomming buffer to client directly.
       */

      res.setHeader("x-proxy-bypass", 1);
      if ("content-type" in response.headers)
        res.setHeader("content-type", response.headers["content-type"]);
      if ("content-length" in response.headers)
        res.setHeader("content-length", response.headers["content-length"]);
      return origin.pipe(res);
    }
  });
}

module.exports = proxy;
