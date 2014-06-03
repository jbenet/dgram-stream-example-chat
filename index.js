var dgram = require('dgram')
var dgramStream = require('dgram-stream')
var transDuplex = require('duplex-transform')

// this example shows how to write modules on
// top of dgram-stream using duplex-transform
module.exports = linesOverDgrams

function linesOverDgrams(name, srcPort, dstPorts) {

  var pkts = dgramStream('udp4')
  pkts.bind(srcPort)

  // send it to ourselves to simplify output logic :)
  dstPorts.push(srcPort)

  return transDuplex.obj(lines2pkts, pkts, pkts2lines)

  function lines2pkts(data, enc, next) {
    // transform data
    data = new Buffer(name + ': '+ data.toString().trim() + '\n')

    // send it to all dst ports
    for (var i in dstPorts)
      this.push({ to: { port: dstPorts[i] }, payload: data })

    next()
  }

  function pkts2lines(data, enc, next) {
    this.push(data.payload)
    next()
  }
}

// see example3.user.js
