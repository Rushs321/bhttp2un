#!/usr/bin/env node
'use strict';



    const PORT = process.env.PORT || 8080;
    const app = require('./index');
    const spdy = require('spdy');
    const fs = require('fs');


    // Turn on SSL if possible, but run http2c if not.
    // http2c makes if SSL is offloaded.
    const keyPath = './cert/privkey.pem';
    const certPath = './cert/fullchain.pem';
    let ssl = true;
    let plain = true;
    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        ssl = {
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certPath),
        };
        plain = false;
    }

    const options = {

        // **optional** SPDY-specific options
        spdy: {
            protocols: ['h2', 'spdy/3.1', 'http/1.1'],
            ssl: ssl,
            plain: plain,
            connection: {
                windowSize: 1024 * 1024, // Server's window size
                // **optional** if true - server will send 3.1 frames on 3.0 *plain* spdy
                // helpful for best performance behind SSL offload.
                autoSpdy31: true
            }
        }
    };

    spdy.createServer(options, app).listen(PORT, () => console.log(`Listening on ${PORT}`));
          
