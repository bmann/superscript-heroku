'use strict';

var _superscript = require('superscript');

var _superscript2 = _interopRequireDefault(_superscript);

var _slackClient = require('slack-client');

var _slackClient2 = _interopRequireDefault(_slackClient);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Auth Token - You can generate your token from
// http://my.slack.com/apps/new/A0F7YS25R-bots
var token = process.env.SLACK_TOKEN;

// How should we reply to the user?
// direct - sents a DM
// atReply - sents a channel message with @username
// public sends a channel reply with no username

// slack-client provides auth and sugar around dealing with the RealTime API.
var replyType = 'atReply';

var atReplyRE = /<@(.*?)>/;

var slack = new _slackClient2.default(token, true, true);

var receiveData = function receiveData(slack, bot, data) {
  // Fetch the user who sent the message;
  var user = data._client.users[data.user];
  var channel = void 0;
  var messageData = data.toJSON();
  var message = '';

  if (messageData && messageData.text) {
    message = '' + messageData.text.trim();
  }

  var match = message.match(atReplyRE);

  // Are they talking to us?
  if (match && match[1] === slack.self.id) {
    message = message.replace(atReplyRE, '').trim();
    if (message[0] === ':') {
      message = message.substring(1).trim();
    }

    bot.reply(user.name, message, function (err, reply) {
      // We reply back direcly to the user
      switch (replyType) {
        case 'direct':
          channel = slack.getChannelGroupOrDMByName(user.name);
          break;
        case 'atReply':
          reply.string = '@' + user.name + ' ' + reply.string;
          channel = slack.getChannelGroupOrDMByID(messageData.channel);
          break;
        case 'public':
          channel = slack.getChannelGroupOrDMByID(messageData.channel);
          break;
      }

      if (reply.string) {
        channel.send(reply.string);
      }
    });
  } else if (messageData.channel[0] === 'D') {
    bot.reply(user.name, message, function (err, reply) {
      channel = slack.getChannelGroupOrDMByName(user.name);
      if (reply.string) {
        channel.send(reply.string);
      }
    });
  } else {
    console.log('Ignoring...', messageData);
  }
};

var botHandle = function botHandle(err, bot) {
  slack.login();

  slack.on('error', function (error) {
    console.error('Error: ' + error);
  });

  slack.on('open', function () {
    console.log('Welcome to Slack. You are %s of %s', slack.self.name, slack.team.name);
  });

  slack.on('close', function () {
    console.warn('Disconnected');
  });

  slack.on('message', function (data) {
    receiveData(slack, bot, data);
  });
};

// Main entry point
var options = {
  factSystem: {
    clean: true
  },
  importFile: './data.json',
  logPath: null,
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:5000/superscriptdb'
};

_superscript2.default.setup(options, function (err, bot) {
  botHandle(null, bot);
});