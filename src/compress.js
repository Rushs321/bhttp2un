/*
 * compress.js
 * A module that compress a image.
 * compress(httpRequest, httpResponse, ReadableStream);
 */
const sharp = require('sharp')
const redirect = require('./redirect')

function compress(req, res, input) {
  const format = req.params.webp ? 'webp' : 'jpeg'

  /*
   * Determine the uncompressed image size when there's no content-length header.
   */
  if (req.params.originSize < 1) {
    req.params.originSize = 0;
    input.on('data', c => req.params.originSize += c.length);
  }

  /*
   * input.pipe => sharp (The compressor) => Send to httpResponse
   * The following headers:
   * |  Header Name  |            Description            |           Value            |
   * |---------------|-----------------------------------|----------------------------|
   * |x-original-size|Original photo size                |OriginSize                  |
   * |x-bytes-saved  |Saved bandwidth from original photo|OriginSize - Compressed Size|
   */
  input.pipe(
    sharp()
      .grayscale(req.params.grayscale)
      [format]({
        quality: req.params.quality,
        progressive: true,
        optimizeScans: true,
        lossless: true
      })
      .toBuffer((err, output, info) => {
        if (err || !info || res.headersSent || info.size > req.params.originSize) return redirect(req, res);

        res.setHeader('content-type', 'image/' + format);
        res.setHeader('content-length', info.size);
        res.setHeader('x-original-size', req.params.originSize);
        res.setHeader('x-bytes-saved', req.params.originSize - info.size);
        res.status(200);
        res.write(output);
        res.end();
      })
    );
}

module.exports = compress
