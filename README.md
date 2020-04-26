# node-red-contrib-shure-4ad
This Node-RED module allows you to send and receive messages from and to Shure wireless microphone receivers of the Axient&reg; Digital product line. It is currently only tested with the AD4Q but should also work with the AD4D.

## Shure AD4 Receiver Config Node
**Name**
The property Name is used for display purposes in the editor and is also used in the message topic (see AD4 response node and AD4 sample node for details on the message topic).

**Host**
The IP address or hostname of your Shure AD4 device.

**Meter rate (ms)**
The AD4 receivers can send metering data in intervals between 100 and 65535 milliseconds. Use the AD4 sample node to receive them. Set it to 0 to disable it (default).


## Shure AD4 Request Node
Use the request node to send messages to a receiver. There are three options to pass the necessary data to the node.

### Option 1 – Object in the msg.payload
Pass an object with the following structure as payload to the node:
    
    {
	    commandType: "SET",  // GET or SET
	    command: "FLASH", // See commands section for details on the commands.
	    channel: "1", // Optional, depending on the command.
	    value: "ON" // Optional, depending on the command.
    }

### Option 2 – Topic
Pass a topic (msg.topic) with the following structure to the node. The value goes into the msg.payload.

For commands with channel: `[COMMAND_TYPE]/[COMMAND]/[CHANNEL]`

For commands without channel: `[COMMAND_TYPE]/[COMMAND]`

Example:
 
    msg.topic = “SET/FLASH/1”;
    msg.payload = “ON”;

### Option 3 – Node properties
You can also set the necessary information in the node properties. _Command type_ and _Command_ are required. _Channel_ is optional. The value has to be in the msg.payload.

## Shure AD4 Response Node
Use the response node to receive REP messages send by a receiver. The node sends a msg with a topic in the following format and the value as msg.payload.

`[RECEIVER_NAME]/REP/[COMMAND]/[CHANNEL]`

E.g.: `Receiver-1/REP/FLASH/1` with payload "ON".

If you set the node property _Topic prefix_ the topic format is as follows:

`[TOPIC_PREFIX]/[RECEIVER_NAME]/REP/[COMMAND]/[CHANNEL]`

The msg object also includes the field raw with the original message from the receiver.

You can use the _Command_ and _Channel_ properties of the node to filter for a specific command and/or channel.

## Shure AD4 Sample Node
The sample node is used to receive sample massages which are send periodically by the receiver. You can set the interval in the receiver config node (Meter rate (ms) property).
A sample message from a receiver contains several values. You can choose between two ways in which the node will handle these values by changing the Mode property of the node. With the option “One msg per value” the node sends a msg for each value. The values can be filtered via the _Commands_ property of the node. The msg is structured as follows:

`[TOPIC_PREFIX]/[RECEIVER_NAME]/SAMPLE/[COMMAND]/[CHANNEL]`

With the option "One msg with all values" the node sends a single msg including all values as an object in the payload. The _Commands_ filter property has no effect in this mode. The object is structured as follows:

    {
        	"raw":"< SAMPLE 3 ALL 255 000 005 020 XX 00 005 00 006 >",
        	"commandType":"SAMPLE",
        	"channel":"3",
        	"qual":"255",
        	"audBitmap":"000",
        	"audPeak":"005",
        	"audRms":"020",
        	"rfAntStats":"XX",
        	"rfBitmapA":"00",
        	"rfRssiA":"005",
        	"rfBitmapB":"00",
        	"rfRssiB":"006"
    }
    
The topic is set to `[TOPIC_PREFIX]/[RECEIVER_NAME]/SAMPLE/ALL/[CHANNEL]`.


## Commands
Details on the commands can be found on the Shure website:

https://www.shure.com/de-DE/produkte/funkmikrofon-systeme/axient_digital/ad4q

https://d24z4d3zypmncx.cloudfront.net/Pubs/AD4D/Axient_Digital_network_string_commands.pdf
