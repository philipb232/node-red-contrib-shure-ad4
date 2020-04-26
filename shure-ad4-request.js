module.exports = function(RED) {
    function ShureAD4RequestNode(config) {
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

        node.sendShureMsg = function(shureObject) {
            // Build msg
            var msg = "< " + shureObject.commandType + " ";
            if(shureObject.channel) msg += shureObject.channel + " ";
            msg += shureObject.command + " ";
            if(shureObject.value) {
                if (typeof shureObject.value === 'string') {
                    if (!shureObject.value.match(/^[A-Z0-9]*$/) && !shureObject.value.match(/^{.*}$/)) shureObject.value = "{" + shureObject.value + "}";
                    msg += shureObject.value + " ";
                } else {
                    node.error("Value is not a string! Msg will be send without a value!");
                }
            }
            msg += ">";

            // Send msg
            node.receiver.send(msg);
        }

        node.on('input', function(msg, send, done) {
            var shureObject;
            // If payload is an object
            if(msg.payload !== null && typeof msg.payload === 'object') {
                shureObject = msg.payload;
                // Is valid shure object?
                if ((shureObject.commandType !== 'GET' && shureObject.commandType !== 'SET') || !shureObject.command) {
                    node.warn("No valid shure object passed!");
                } else {
                    node.sendShureMsg(shureObject);
                    if (done) done();
                    return;
                }
            }

            // If topic is present
            if(msg.topic) {
                var topicGrouped = msg.topic.match(/(GET|SET)\/([A-Z_]+)\/?([0-4]?)/);
                if(topicGrouped && topicGrouped[0]) {
                    shureObject = {
                        commandType: topicGrouped[1],
                        command: topicGrouped[2],
                        channel: topicGrouped[3],
                        value: msg.payload
                    }
                    node.sendShureMsg(shureObject);
                    if(done) done();
                    return;
                } else {
                    node.warn("No valid topic passed!");
                }
            }

            // If node configuration is present
            if(config.commandType && config.command) {
                shureObject = {
                    commandType: config.commandType,
                    command: config.command,
                    channel: config.channel,
                    value: msg.payload
                }
                node.sendShureMsg(shureObject);
                if(done) done();
                return;
            }

            // Else throw error
            node.error("No valid configuration available!");
            if (done) done();
        });
    }

    RED.nodes.registerType("shure-ad4-request", ShureAD4RequestNode);
}
