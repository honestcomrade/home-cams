const onvif = require('node-onvif');
const fs = require('fs');
const moment = require('moment');
const ftpClient = require('ftp-client');

// keys and ips and stuff
const config = require('./config');

const ftpConfig = {
  config: 'ftp',
  host: config.ftpHost.ip,
  port: '21',
  user: config.ftpHost.user,
  password: config.ftpHost.pass,
};

const ftpOpts = {
  logging: 'debug',
  overwrite: 'none',
};

const client = new ftpClient(ftpConfig, ftpOpts);

client.connect(() => {
  client.upload('test/file.txt', 'media', {
    baseDir: 'test',
  }, function(result) {
    console.log('RESULT: ', result);
  });
  // client.download('/media/test', 'test', {
  //   overwrite: 'all',
  // }, (res) => {
  //   console.log(res);
  // });
});