const axios = require("axios");

const config = require("../config.js");

let access_token = "";

const req = axios.create({
  baseURL: config.trading.URL,
  timeout: 5000,
});

module.exports.setAccessToken = (token) => {
  access_token = token;
};

module.exports.fetch = (opts) => {
  return req({
    ...opts,
    headers: {
      Authorization: `Bearer ${access_token}`,
      ...opts.headers,
    },
  });
};
