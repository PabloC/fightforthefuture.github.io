/**
 * Sends a request to the Action Network middleman to fetch petition IDs.
 *
 * @param {string} apiUrl - fftf action network middleman api url
 * */

var http = require('http');
var https = require('https');
var url = require('url');
var Habitat = require('habitat');
var fs = require('fs');

Habitat.load('.env');

var
  env = new Habitat('', {
    petitions_api: 'http://0.0.0.0:9104'
  });

(function () {
  "use strict";

  function compilePetitionsConfig(responseData) {

    var
      petitions = JSON.parse(responseData),
      petitionsConfig = 'petition_identifiers:\n',
      i = petitions.length;


    while (i--) {
      petitionsConfig += '  "' + petitions[i].title + '": "' + petitions[i].identifier + '"\n';
    }

    fs.writeFile('_config_petition_ids.yml', petitionsConfig, 'utf-8', function (error) {
      if (error) {
        console.error('it’s not good, Lin.', error);
        return false;
      }

      console.info(petitions.length + ' petitions found.');
    });
  }

  function displayError(error) {
    console.error('error: ', error);
  }

  return new Promise(function (successCallback, failureCallback) {
    var
      location = url.parse(env.get('petitions').api),
      protocol = location.protocol === 'https' ? https : http,
      options = {
        hostname: location.hostname,
        path: '/petition/list',
        method: 'GET',
        port: location.port,
        headers: {
          'Content-Type': 'application/json'
        }
      },
      responseData = '',
      request = protocol.request(options, function (response) {
        response.setEncoding('utf8');

        response.on('data', function (chunk) {
          responseData += chunk;
        });

        response.on('end', function () {
          successCallback(responseData);
        });
      });

    request.on('error', function (error) {
      failureCallback(error);
    });
    request.end();
  }).then(compilePetitionsConfig, displayError);
}());
