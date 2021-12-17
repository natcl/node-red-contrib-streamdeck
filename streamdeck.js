const { openStreamDeck, listStreamDecks } = require('@elgato-stream-deck/node')
const Jimp = require('jimp')

let myStreamDeck = null

async function streamDeckInit () {
  if (!myStreamDeck) {
    try {
      console.log('Initialiazing Stream Deck...')
      const streamDeck = await openStreamDeck()
      streamDeck.on('error', error => {
        console.error(error)
      })
      myStreamDeck = streamDeck
    } catch (error) {
      console.error('Error opening Stream Deck device', error)
    }
  }
}

module.exports = function (RED) {
  function StreamDeckIn (config) {
    RED.nodes.createNode(this, config)
    const node = this
    if (!myStreamDeck) {
      streamDeckInit().then(sd => {
        if (myStreamDeck) {
          myStreamDeck.on('up', keyIndex => {
            node.send({ topic: keyIndex, payload: 0 })
          })
          myStreamDeck.on('down', keyIndex => {
            node.send({ topic: keyIndex, payload: 1 })
          })
        }
      }).catch(error => {
        console.error(error)
      })
    }
  }

  function StreamDeckOut (config) {
    RED.nodes.createNode(this, config)
    const node = this
    node.on('input', async function (msg) {
      if (!myStreamDeck) await streamDeckInit()
      if (myStreamDeck) {
        const keyIndex = parseInt(msg.topic)
        if (msg.payload.command) {
          switch (msg.payload.command) {
            case 'fillColor':
              if (!Number.isInteger(keyIndex)) {
                node.error('keyIndex missing in topic', msg)
                return
              }
              try {
                await myStreamDeck.fillKeyColor(keyIndex, ...msg.payload.value)
              } catch (error) {
                node.error('Can\'t write to StreamDeck', msg)
              }
              break
            case 'fillImage':
              if (!Number.isInteger(keyIndex)) {
                node.error('keyIndex missing in topic', msg)
                return
              }
              Jimp.read(msg.payload.image, async (err, image) => {
                if (err) {
                  node.error(err, msg)
                  return
                }
                image = image.resize(myStreamDeck.ICON_SIZE, myStreamDeck.ICON_SIZE).bitmap.data
                const finalBuffer = Buffer.alloc(myStreamDeck.ICON_SIZE ** 2 * 3)
                for (let p = 0; p < image.length / 4; p++) {
                  image.copy(finalBuffer, p * 3, p * 4, p * 4 + 3)
                }
                try {
                  await myStreamDeck.fillKeyBuffer(keyIndex, finalBuffer)
                } catch (error) {
                  console.error(error)
                  node.error('Can\'t write to StreamDeck', msg)
                }
              })
              break
            case 'fillPanel':
              Jimp.read(msg.payload.image, async (err, image) => {
                if (err) {
                  node.error(err, msg)
                  return
                }
                image = image.resize(myStreamDeck.ICON_SIZE * myStreamDeck.KEY_COLUMNS, myStreamDeck.ICON_SIZE * myStreamDeck.KEY_ROWS).bitmap.data
                const finalBuffer = Buffer.alloc((myStreamDeck.ICON_SIZE * myStreamDeck.KEY_COLUMNS * myStreamDeck.ICON_SIZE * myStreamDeck.KEY_ROWS * 3))
                for (let p = 0; p < image.length / 4; p++) {
                  image.copy(finalBuffer, p * 3, p * 4, p * 4 + 3)
                }
                try {
                  await myStreamDeck.fillPanelBuffer(finalBuffer)
                } catch (error) {
                  console.error(error)
                  node.error('Can\'t write to StreamDeck', msg)
                }
              })
              break
            case 'clearAllKeys':
              try {
                await myStreamDeck.clearPanel()
              } catch (error) {
                node.error('Can\'t write to StreamDeck', msg)
              }
              break
            case 'clearKey':
              if (!Number.isInteger(keyIndex)) {
                node.error('keyIndex missing in topic')
                return
              }
              try {
                await myStreamDeck.clearKey(keyIndex)
              } catch (error) {
                node.error('Can\'t write to StreamDeck', msg)
              }
              break
            case 'resetToLogo':
              try {
                await myStreamDeck.resetToLogo()
              } catch (error) {
                node.error('Can\'t write to StreamDeck', msg)
              }
              break
            case 'setBrightness':
              try {
                await myStreamDeck.setBrightness(msg.payload.value)
              } catch (error) {
                node.error('Can\'t write to StreamDeck', msg)
              }
              break
            case 'listStreamDecks':
              try {
                node.warn(await listStreamDecks())
              } catch (error) {
                node.error('Can\'t write to StreamDeck', msg)
              }
              break
          }
        }
      } else {
        node.error('Stream Deck connection issue', msg)
      }
    })
    node.on('close', async function () {
      await myStreamDeck.close()
      myStreamDeck = null
    })
  }
  RED.nodes.registerType('streamdeck-in', StreamDeckIn)
  RED.nodes.registerType('streamdeck-out', StreamDeckOut)
}
