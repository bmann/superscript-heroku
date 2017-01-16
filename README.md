# SuperScript Chat bot

SuperScript is a "dialogue engine for creating chat bots". Find out more in the [superscriptjs/superscript](https://github.com/superscriptjs/superscript) repo, or visit the [superscriptjs.com](http://superscriptjs.com/) website.

## Express Client on Heroku

This repo takes the output of init'ing a basic bot running the express client and configures it to easily run on Heroku.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## Slack Client on Heroku

The slack-client branch creates a superscript powered bot that sits in your Slack. You'll need to create a bot and give it a name in the [Slack apps directory](http://my.slack.com/apps/A0F7YS25R-bots) in order to get a token that lets your bot connect to your Slack.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/bmann/superscript-heroku/tree/slack-client)

Creating the bot in the Slack directory means you'll see the bot appear in your Slack as offline. When your server from above is running correctly, the status of the bot will go green, and you can say "Hi" to it and it will respond.