module.exports = function(RED) {
    function ShureAD4SampleNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.receiver = RED.nodes.getNode(config.receiver);

        node.receiver.on('status_change', function(status) {
           if(status === 1) {
               node.status({fill:"green",shape:"dot",text:"connected"});
           } else {
               node.status({fill:"red",shape:"ring",text:"disconnected"});
           }
        });

        node.receiver.on('sample_response', function(sample) {
            var msg = {
                raw: sample.raw,
                topic: node.receiver.hostName + "/SAMPLE/" + sample.channel
            }

            if(config.topic) {
                msg.topic = config.topic + '/' + sample.topic;
            }

            if(config.mode === "One msg per value") {
                node.sendSingleSample(msg, "CHANNEL_QUALITY", sample.qual);
                node.sendSingleSample(msg, "AUDIO_LED_BITMAP", sample.audBitmap);
                node.sendSingleSample(msg, "AUDIO_LEVEL_PEAK", sample.audPeak);
                node.sendSingleSample(msg, "AUDIO_LEVEL_RMS", sample.audRms);
                node.sendSingleSample(msg, "ANTENNA_STATUS", sample.rfAntStats);
                node.sendSingleSample(msg, "RSSI_LED_BITMAP/1", sample.rfBitmapA);
                node.sendSingleSample(msg, "RSSI/1", sample.rfRssiA);
                node.sendSingleSample(msg, "RSSI_LED_BITMAP/2", sample.rfBitmapB);
                node.sendSingleSample(msg, "RSSI/2", sample.rfRssiB);
            } else {
                msg.topic += "/ALL";
                msg.payload = sample;
                node.send(msg);
            }
        });

        node.sendSingleSample = function(msg, command, value) {
            if(value && (!config.commands || config.commands.includes(command))) {
                node.send({
                    raw: msg.raw,
                    topic: msg.topic + "/" + command,
                    payload: value
                });
            }
        }
    }

    RED.nodes.registerType("shure-ad4-sample", ShureAD4SampleNode);
}
