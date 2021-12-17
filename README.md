# node-red-contrib-streamdeck

A Node-RED node to interact with the Elgato Stream Deck products.

Note: this node connects directly to the Stream Deck, it cannot be used in conjunction with Elgato's Stream Deck software which will need to be closed for this node to work.

# Installation

## Local
```
npm install --save node-red-contrib-streamdeck
```

## Global
```
npm install -g node-red-contrib-streamdeck
```

## Linux

On Linux, you will need to add these to `/etc/udev/rules.d/50-elgato.rules` :

```
SUBSYSTEM=="input", GROUP="input", MODE="0666"
SUBSYSTEM=="usb", ATTRS{idVendor}=="0fd9", ATTRS{idProduct}=="0060", MODE:="666", GROUP="plugdev"
SUBSYSTEM=="usb", ATTRS{idVendor}=="0fd9", ATTRS{idProduct}=="0063", MODE:="666", GROUP="plugdev"
SUBSYSTEM=="usb", ATTRS{idVendor}=="0fd9", ATTRS{idProduct}=="006c", MODE:="666", GROUP="plugdev"
SUBSYSTEM=="usb", ATTRS{idVendor}=="0fd9", ATTRS{idProduct}=="006d", MODE:="666", GROUP="plugdev"
SUBSYSTEM=="usb", ATTRS{idVendor}=="0fd9", ATTRS{idProduct}=="0080", MODE:="666", GROUP="plugdev"
```

And run `sudo udevadm control --reload-rules`

# Usage

## stream deck in

The input node will allow you to get which keys are pressed on the unit.

The key index will be sent as `msg.topic` as an integer starting from 0. The key state (down or up) will be sent as an integer in `msg.payload`. 1 is down and 0 is up.

## stream deck out

The output node is used to send images to the keys and control various functions.

### Inputs

payload: This should be an object containing a command property. Some commands require additional properties, described in the commands section below.

topic: An integer representing the index of the key to send the command to, starts at 0.

### Commands

#### fillColor array
Should have a value property containing an array of color values in RGB order, between 0 and 255. keyIndex should be passed as the topic.

#### fillImage path | url | buffer
Should have an image property containing either a file path, url or buffer containing image data. keyIndex should be passed as the topic.

#### fillPanel path | url | buffer
Same as fillImage but will fill the entire panel.

#### clearKey
Will clear a key with keyIndex passed as topic.

#### clearAllKeys
Will clear the whole panel.

#### resetToLogo
Will show the default Stream Deck logo.

#### setBrightness integer
Should have a value property containing an integer between 0 and 100.

#### listStreamDecks
Will list the available Stream Decks.

Example

```json
{
  "topic": 3
  "payload" : {
    "command": "fillImage",
    "image": "./node-red.png"
  }
}
```
