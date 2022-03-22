module.exports = function(RED) {
    function ShureAD4ResponseNode(config) {
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

        node.receiver.on('rep_response', function(rep) {

            if(config.command && config.command !== rep.command) return;
            if(config.channel && config.channel !== rep.channel) return;

            var msg = {
                topic: rep.name + '/' + rep.commandType + '/' + rep.command
            }

            if(config.mode === 'value') {
                msg.payload = rep.value;
            } else {
                msg.payload = rep;
            }

            if(rep.channel) {
                msg.topic += '/' + rep.channel;
            }

            if(config.topic) {
                msg.topic = config.topic + '/' + msg.topic;
            }

            node.send(msg);
        });


    }

    RED.nodes.registerType("shure-ad4-response", ShureAD4ResponseNode);
}
