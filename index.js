var stream = require('logrotate-stream'),
    mkdirp = require('mkdirp');

require('date-utils');

module.exports = function(client) {
    client.on('join', function(channel, nick) {
        if( nick == client.nick ) {
            mkdirp('./logs', function(err) {
                if( err ) throw err;

                console.log('creating log stream for', channel);
                var log = stream({ file: './logs/'+channel, size: '10m', keep: 20, compress: true });

                function listener(nick, text, message) {
                    console.log('writing message', nick, text, message);
                    log.write((new Date).toFormat('YYYY/MM/DD HH:MM')+' '+nick+': '+text+'\n');
                }

                client.on('message'+channel, listener);

                client.once('part'+channel, function(nick, reason) {
                    client.removeListener('message'+channel, listener);
                    log.end();
                });
            });
        }
    });
};
