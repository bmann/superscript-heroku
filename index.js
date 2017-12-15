const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const process = require('process');
const relay = require('librelay');
const uuid4 = require('uuid/v4');

const PORT = process.env.PORT || 1138;
const WEBHOOK_URN = process.env.WEBHOOK_URN || '';
const THREAD_ID = process.env.THREAD_ID || '308044cd-b80d-4bf5-b5c0-c6063388c382';
const DEST_ADDR = '897cb2b4-e35d-408c-830d-cc87f2116f74';
const DIST = '<b92d39d4-2e83-49e6-999b-453231275777>';

async function onWebhookPost(req, res) {
    console.info('Processing WebHook:', req.body);
    try {
        const msgSender = await relay.MessageSender.factory();
        const msgBus = await msgSender.sendMessageToAddrs([DEST_ADDR], [{
            version: 1,
            threadType: 'conversation',
            messageType: 'content',
            messageId: uuid4(),
            userAgent: 'relay-bot-heroku',
            data: {
                body: [{
                    type: 'text/plain',
                    value: JSON.stringify(req.body)
                }]
            },
            sender: {
                userId: await relay.storage.getState('addr')
            },
            threadId: THREAD_ID,
            distribution: {
                expression: DIST
            }
        }], null, Date.now());
        let done = false;
        msgBus.on('error', ev => {
            console.error('Message send error', ev);
            if (!done) {
                done = true;
                res.status(400).json(ev);
            }
        });
        msgBus.on('sent', ev => {
            if (!done) {
                done = true;
                res.status(200).json(ev);
            }
        });
    } catch(e) {
        console.error('Message send error:', e);
        res.status(500).json({error: e.toString()});
    }
}

async function input(prompt) {
    const rl = require('readline').createInterface(process.stdin, process.stdout);
    try {
        return await new Promise(resolve => rl.question(prompt, resolve));
    } finally {
        rl.close();
    }
}

async function register(slug) {
    const [user, org] = slug.split(':');
    const validate = await relay.auth.requestCode(org, user);
    const code = await input("SMS Verify Code: ");
    const auth = await validate(code);
    await relay.AccountManager.register(auth);
    await relay.storage.shutdown();
    process.exit(0);
}

async function main() {
    const app = express();
    app.use(bodyParser.urlencoded({extended: false}));
    app.post(path.join('/webhook', WEBHOOK_URN), onWebhookPost);
    app.listen(PORT);
}

process.on('unhandledRejection', ev => {
    console.error(ev);
});

const command = (process.argv[2] === 'register') ? register : main;
command.apply(this, process.argv.slice(3)).catch(e => {
    console.error(e);
    process.exit(1);
});
