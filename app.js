const onvif = require('node-onvif');
const fs = require('fs');
const moment = require('moment');
const ftpClient = require('ftp-client');

// keys and ips and stuff
const config = require('./config');

// set the camera object settings
const cam = new onvif.OnvifDevice({
  xaddr: config.porchCam.ip,
  user: config.porchCam.user,
  pass: config.porchCam.pass,
});


const ftpConfig = {
  config: 'ftp',
  host: config.ftpHost.ip,
  port: '21',
  user: config.ftpHost.user,
  password: config.ftpHost.pass,
};

const ftpOpts = {
  logging: 'basic',
};

const client = new ftpClient(ftpConfig, ftpOpts);

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
    // const fname = `${displayTime}.${ext}`;
    fs.writeFile(fname, res.body, {encoding: 'binary'}, (err) => {
      if (err) throw err;
      console.log(`Done! Snapshot saved in'${__dirname} as ${fname}`);
      const writeLoc = fname.slice(2);
      const ftpWrite = `${__dirname}/${fname.slice(2)}`;
      client.connect((res2) => {
        client.upload([ftpWrite], '/test/', {
          baseDir: 'media',
          overwrite: 'older',
        }, (resp) => {
          console.log(res2);
        });
      });
    });



    // write the file with this name to avoid dupes

    
  }).catch((error) => {
    console.error(error);
  });
}).catch((error) => {
  console.error(error);
});