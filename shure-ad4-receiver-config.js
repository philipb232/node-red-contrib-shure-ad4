var net = require('net');

module.exports = function(RED) {
    function ShureAD4ReceiverConfigNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.hostName = config.name;

        var client = new net.Socket();
        client.setKeepAlive(true, 5000);

        node.send = function(msg) {
            client.write(msg);
        }

        node.connect = function() {
            client.connect(2202, config.host);
        }
        node.connect();

        node.setStatus = function(status) {
            node.emit("status_change", status);
        }

        client.on('error', function() {
            node.setStatus(0);
            node.debug("Connection to Shure device " + config.host + " failed! Trying to reconnect in 10 seconds...");
            setTimeout(node.connect, 10000);
        });

        client.on('connect', function() {
            node.log("Connected to Shure device at " + config.host);
            node.setStatus(1);

            node.send("< SET 1 METER_RATE " + config.meter + " >");
            node.send("< SET 2 METER_RATE " + config.meter + " >");
            node.send("< SET 3 METER_RATE " + config.meter + " >");
            node.send("< SET 4 METER_RATE " + config.meter + " >");
        });

        client.on('data', function(data) {
            data = data.toString();
            var regex_rep = /< REP ([0-4]?) ?([A-Z_]+) ?([^>]*) >/g;
            var rep;

            while((rep = regex_rep.exec(data)) !== null) {
                var shureMsg = {
                    raw: rep[0],
                    commandType: "REP",
                    channel: rep[1],
                    command: rep[2],
                    value: rep[3]
                }

                if (shureMsg.value && shureMsg.value.match(/^{.*}$/)) {
                    shureMsg.value = shureMsg.value.replace("{", "");
                    shureMsg.value = shureMsg.value.replace("}", "");
                    shureMsg.value = shureMsg.value.trim();
                }

                node.emit('rep_response', shureMsg);
            }

            var regex_sample = /< SAMPLE ([1-4]) ALL ([0-9]{3}) ([0-9]{3}) ([0-9]{3}) ([0-9]{3}) ([XRB]{2,4}) ([0-9]{2}) ([0-9]{3}) ([0-9]{2}) ([0-9]{3})[^>]* >/g;
            var sample;

            while((sample = regex_sample.exec(data)) !== null) {
                var sampleMsg = {
                    raw: sample[0],
                    commandType: "SAMPLE",
                    channel: sample[1],
                    qual: sample[2],
                    audBitmap: sample[3],
                    audPeak: sample[4],
                    audRms: sample[5],
                    rfAntStats: sample[6],
                    rfBitmapA: sample[7],
                    rfRssiA: sample[8],
                    rfBitmapB: sample[9],
                    rfRssiB: sample[10]
                }

                node.emit('sample_response', sampleMsg);
            }
        })

        node.on('close', function() {
            client.destroy();
        })
    }
    RED.nodes.registerType("shure-ad4-receiver-config", ShureAD4ReceiverConfigNode);
}
