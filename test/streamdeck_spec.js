/* eslint-env mocha */
var helper = require('node-red-node-test-helper')
var streamdeck = require('../streamdeck.js')

helper.init(require.resolve('node-red'))

describe('streamdeck Node', function () {
  afterEach(function () {
    helper.unload()
  })

  it('should be loaded', function (done) {
    var flow = [{ id: 'n1', type: 'streamdeck-in', name: 'streamdeck-in' }]
    helper.load(streamdeck, flow, function () {
      var n1 = helper.getNode('n1')
      n1.should.have.property('name', 'streamdeck-in')
      done()
    })
  })
  it('should be loaded', function (done) {
    var flow = [{ id: 'n1', type: 'streamdeck-out', name: 'streamdeck-out' }]
    helper.load(streamdeck, flow, function () {
      var n1 = helper.getNode('n1')
      n1.should.have.property('name', 'streamdeck-out')
      done()
    })
  })
})