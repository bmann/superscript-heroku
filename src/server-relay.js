const relay = require('librelay');
const process = require('process');
const readline = require('readline');

async function input(prompt) {
    const rl = readline.createInterface(process.stdin, process.stdout);
    try {
        return await new Promise(resolve => rl.question(prompt, resolve));
    } finally {
        rl.close();
    }
}


(async function main() {
    // STAGE 1
    // const userTag = await input("Enter your login (e.g user:org): ");
    // const validator = await relay.AtlasClient.authenticate(userTag);
    // await validator(await input("SMS Verification Code: "));

    // STAGE 2
    // await relay.registerAccount();
    // await relay.registerDevice({onProvisionReady: () => null});

    const msgRecv = await relay.MessageReceiver.factory();
    const msgSend = await relay.MessageSender.factory();
    const atlas = await relay.AtlasClient.factory();
    const distCache = new Map();

    const handleMsg = async msg => {
        const incoming = JSON.parse(msg.body)[0];
        const distExpr = incoming.distribution.expression;
        if (!distCache.has(distExpr)) {
            distCache.set(distExpr, await atlas.resolveTags(distExpr));
        }
        const text = incoming.data.body[0].value;
        console.info('Incoming:', text);
        if (Math.random() > .25) {
            clever.ask(text, (err, reply) => {
                if (!err) {
                    console.info('Reply:', reply);
                    msgSend.send({
                        distribution: distCache.get(distExpr),
                        threadId: incoming.threadId,
                        // html: `Re: <q>${text}</q><br/><b>${reply}</b>`,
                        html: `${reply}`,
                        text: reply
                    });
                } else {
                    console.info('had a problem:', err)
                }
            });
        } else {
            console.info('(not replying to that one)');
        }
    };

    msgRecv.addEventListener('message', ev => handleMsg(ev.data.message));
    await msgRecv.connect();
})().catch(e => console.error(e));
