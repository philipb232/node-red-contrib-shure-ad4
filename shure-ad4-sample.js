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
                topic: sample.name + "/SAMPLE"
            }

            if(config.topic) {
                msg.topic = config.topic + '/' + msg.topic;
            }

            if(config.mode === "One msg per value") {
                node.sendSingleSample(msg, "CHANNEL_QUALITY", sample.channel, sample.qual);
                node.sendSingleSample(msg, "AUDIO_LED_BITMAP", sample.channel, sample.audBitmap);
                node.sendSingleSample(msg, "AUDIO_LEVEL_PEAK", sample.channel, sample.audPeak);
                node.sendSingleSample(msg, "AUDIO_LEVEL_RMS", sample.channel, sample.audRms);
                node.sendSingleSample(msg, "ANTENNA_STATUS", sample.channel, sample.rfAntStats);
                node.sendSingleSample(msg, "RSSI_LED_BITMAP/1", sample.channel, sample.rfBitmapA);
                node.sendSingleSample(msg, "RSSI/1", sample.channel, sample.rfRssiA);
                node.sendSingleSample(msg, "RSSI_LED_BITMAP/2", sample.channel, sample.rfBitmapB);
                node.sendSingleSample(msg, "RSSI/2", sample.channel, sample.rfRssiB);
            } else {
                msg.topic += "/ALL/" + sample.channel;
                msg.payload = sample;
                node.send(msg);
            }
        });

        node.sendSingleSample = function(msg, command, channel, value) {
            if(value && (!config.commands || config.commands.includes(command))) {
                node.send({
                    topic: msg.topic + "/" + command + "/" + channel,
                    payload: value
                });
            }
        }
    }

    RED.nodes.registerType("shure-ad4-sample", ShureAD4SampleNode);
}
