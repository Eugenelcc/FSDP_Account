const speakeasy = require("speakeasy");
const qrcode = require("qrcode");

var secret = speakeasy.generateSecret({
  name: "NODE",
});

qrcode.toDataURL(secret.otpauth_url, function (err, data) {  console.log(data);});

var verified = speakeasy.totp.verify({
  secret: "nePQAGKMsUk06o/TvEX&trMUOXnUgwpv",
  encoding: "ascii",
  token: "123123",
});
console.log(verified)
