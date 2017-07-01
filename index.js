'use strict';

const Hapi = require('hapi');
const request = require('request');
const cheerio = require('cheerio');
const Monitor = require('monitor');

const URL = 'https://play.google.com/store/apps/details?id=';

// const server = new Hapi.Server();
//
//
// server.connection({
//   host: 'localhost',
//   port: 8080
// });

const lineToken = 'icc8KzH0dQH8nJYI5IX0VOpEZRlmCbyXdHkUW7f6336';

let options = {
  probeClass: 'Process',
  initParams: {
    pollInterval: 10000
  }
}

const processMonitor = new Monitor(options);

function loadData() {
  return new Promise((resolve, reject) => {

    let url = `http://burstcoin.biz/address/11838271257372488268`;

    request(url, (err, res, body) => {

      if (!err && res.statusCode === 200) {

        let $ = cheerio.load(body);

        let balance = $('abbr').eq(0).text().trim();

        console.log('loaded ' + balance);

        resolve(balance);

      } else {
        reject("if error in loaded");
      }
    });
  })
}

let count = 0;

let old;
processMonitor.on('change', () => {

  count=1;

  if(count == 0)
    old = '0';

  loadData().then((res) => {

    console.log(res.length);

    let msg = 'prev = ' + old + 'curent : ' + res;

    old = res.slice(0, (res.length));

    request({
      method: 'POST',
      uri: 'https://notify-api.line.me/api/notify',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      'auth': {
        'bearer': lineToken
      },
      form: {
        message: msg
      }
    }, (err, httpResponse, body) => {
      console.log(err);
      // console.log(httpResponse);
      console.log(body);
    })
  }).catch((err) => {
    console.log("case error in send to line");
  })



});


processMonitor.connect((err) => {
  if (err) {
    console.error('Error connecting with the process probe: ', err);
    process.exit(1);
  }
});


//
// server.route({
//   method: 'GET',
//   path: '/',
//
//   handler: (req, reply) => {
//
//     let appId = req.params.appId;
//
//     let url = `http://burstcoin.biz/address/11838271257372488268`;
//
//     request(url, (err, res, body) => {
//
//       if (!err && res.statusCode === 200) {
//
//         let $ = cheerio.load(body);
//
//         let balance = $('abbr').eq(0).text().trim();
//
//         console.log(balance);
//
//         reply({
//           data: {
//             balance: balance
//           }
//         });
//
//       } else {
//         reply({
//           message: `We're sorry, the requested ${url} was not found on this server.`
//         });
//       }
//     });
//
//   }
// });
//
// server.start(err => {
//   console.log(`Server running at ${server.info.uri}`);
// });
