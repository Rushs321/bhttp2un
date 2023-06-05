# Bandwidth Hero Data Compression Service

This data compression service is used by
[Bandwidth Hero](https://github.com/ayastreb/bandwidth-hero) browser extension. It compresses given
image to low-res [WebP](https://developers.google.com/speed/webp/) or JPEG image. Optionally it also
converts image to greyscale to save even more data.

It downloads original image and transforms it with [Sharp](https://github.com/lovell/sharp) on the
fly without saving images on disk.

This is **NOT** an anonymizing proxy &mdash; it downloads images on user's behalf, passing cookies
and user's IP address through to the origin host.

## Fork Notable Changes
- Cluster support
- Change on codes, Including how it handle buffers
- Added animation support (Which is CPU intensive. Disable by setting `NO_ANIMATE` in env variable)

## Deployment Requirement
- Atleast [NodeJS](https://nodejs.org) >= 14 is installed.
- [libvips](https://github.com/libvips/libvips) >= 8.14.2
  (You should not need to compile libvips from source if sharp could be installed in your machine/container without any problem)

## Setting up
Clone the repository, and install required dependencies

```sh
git clone https://github.com/Yonle/bandwidth-hero-proxy
npm install
```

Once finished, Start the server.
```sh
node server.js
```

You may change / set `PORT` env variable if you want to listen to another port.

If you think your forked cluster is less than 2, You could set `CLUSTERS` env variable with integer value depending how many clusters you would like to fork.
