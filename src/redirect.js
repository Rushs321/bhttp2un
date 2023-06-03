function redirect(req, res) {
  if (res.headersSent) return;

  res.setHeader('content-length', 0);
  res.removeHeader('cache-control');
  res.removeHeader('expires');
  res.removeHeader('date');
  res.removeHeader('etag');
  res.setHeader('location', encodeURI(req.params.url));
  res.status(302).end();

  console.log(`Worker ${process.pid}:`, `Redirected to ${req.params.url}`);
}

module.exports = redirect
