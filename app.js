const onvif = require('node-onvif');
const fs = require('fs');
const moment = require('moment');

// keys and ips and stuff
const config = require('./config');

// set the camera object settings
const cam = new onvif.OnvifDevice({
  xaddr: config.porch.ip,
  user: config.porch.user,
  pass: config.porch.pass,
});

// initialize the camera and get some info
cam.init().then((info) => {
  console.log(JSON.stringify(info, null, ' '));
  console.log(cam.getUdpStreamUrl());

  // take a snapshot
  console.log('taking snapshot...');
  cam.fetchSnapshot().then((res) => {
    // Determine the file extention
    let ext = 'bin';
    let mime_pair = res.headers['content-type'].split('/');
    if(mime_pair[0] === 'image') {
      ext = mime_pair[1];
    }
    // Save the data to a file
    const now = moment().valueOf();
    const displayTime = moment(now).format('MM-DD-YYYY--hh-mm-ss');
    const fname = `./snapshots/${displayTime}.${ext}`;
    // write the file with this name to avoid dupes
    fs.writeFileSync(fname, res.body, {encoding: 'binary'});
    console.log(`Done! Snapshot saved in'${__dirname} as ${fname}`);
  }).catch((error) => {
    console.error(error);
  });
}).catch((error) => {
  console.error(error);
});