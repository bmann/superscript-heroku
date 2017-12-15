'use strict';

var _superscript = require('superscript');

var _superscript2 = _interopRequireDefault(_superscript);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var server = (0, _express2.default)();
var PORT = process.env.PORT || 5000;

server.use(_bodyParser2.default.json());

var bot = void 0;

server.get('/superscript', function (req, res) {
  if (req.query.message) {
    return bot.reply('user1', req.query.message, function (err, reply) {
      res.json({
        message: reply.string
      });
    });
  }
  return res.json({ error: 'No message provided.' });
});

var options = {
  factSystem: {
    clean: true
  },
  importFile: './data.json',
  logPath: null,
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:5000/superscriptdb'
};

_superscript2.default.setup(options, function (err, botInstance) {
  if (err) {
    console.error(err);
  }
  bot = botInstance;

  server.listen(PORT, function () {
    console.log('===> \uD83D\uDE80  Server is now running on port ' + PORT);
  });
});