
var fs = require("fs")
var Web3 = require('web3')
var web3 = new Web3()

var dir = "./compiled/"

var code = "0x" + fs.readFileSync(dir + "Coindrop.bin")
var abi = JSON.parse(fs.readFileSync(dir + "Coindrop.abi"))

var config = JSON.parse(fs.readFileSync("/home/sami/webasm-solidity/node/config.json"))

var host = config.host

var send_opt = {gas:4700000, from:config.base}

web3.setProvider(new web3.providers.WebsocketProvider('ws://' + host + ':8546'))

var filesystem = new web3.eth.Contract(JSON.parse(fs.readFileSync("/home/sami/webasm-solidity/contracts/compiled/Filesystem.abi")), config.fs)

function arrange(arr) {
    var res = []
    var acc = ""
    arr.forEach(function (b) { acc += b; if (acc.length == 64) { res.push("0x"+acc); acc = "" } })
    console.log(res)
    return res
}

async function createFile(fname, buf) {
    var nonce = await web3.eth.getTransactionCount(config.base)
    var arr = []
    for (var i = 0; i < buf.length; i++) {
        if (buf[i] > 15) arr.push(buf[i].toString(16))
        else arr.push("0" + buf[i].toString(16))
    }
    // logger.info("Nonce %s file", nonce, {arr:arr})
    var tx = await filesystem.methods.createFileWithContents(fname, nonce, arrange(arr), buf.length).send(send_opt)
    var id = await filesystem.methods.calcId(nonce).call(send_opt)
    return id
}

async function doDeploy() {
    var file_id = await createFile("output.data", "")
    var send_opt = {gas:4700000, from:config.base}
    console.log(send_opt, file_id)
    var init_hash = "0x7e176e57dacd1dc924c0a1d0d456d5ee1c25673a84ec8e6cf266a8c3bfc87ba7"
    var code_address = "QmcyyY3xzmViHRsqAafgHCYN59o2JJJKp1tjzgvJCfFZMs"
//    var contract = await new web3.eth.Contract(abi).deploy({data: code, arguments:[]}).send(send_opt)
    var contract = await new web3.eth.Contract(abi).deploy({data: code, arguments:[config.tasks, config.fs, code_address, init_hash, file_id]}).send(send_opt)
//     var arg = {data: code, arguments:[config.tasks, config.fs, code_address, init_hash, file_id]}
    var arg = {data: code, arguments:[]}
    console.log(arg)
//    var contract = await new web3.eth.Contract(abi)
//    var tx = await contract.deploy(arg).send(send_opt, function (err,tx) { console.log("sdf", err, tx) })
//    console.log(tx)
    console.log(contract.options.address)
    config.coindrop = contract.options.address
    console.log(JSON.stringify(config))
    process.exit(0)
}

doDeploy()
