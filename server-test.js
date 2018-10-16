var express 		= require("express");
var app     		= express();
var http 			= require('http').Server(app);
var io 				= require('socket.io')(http);

//var path    		= require("path");
var qs 				= require('querystring');
var Web3 			= require('web3');
var web3;

//var ROPSTEN_WSS = 'www://ropsten.infura.io/ws';
//var provider_rop = new Web3.providers.WebsocketProvider(ROPSTEN_WSS);
//web3_rop = new Web3(provider_rop);

var dateTime = require('node-datetime');
var dt = dateTime.create();
var formatted = dt.format('Y-m-d H:M:S');

// Initialze socket
io.on('connection', function(socket) {
	socket.on('event_user', function(msg){
    	io.emit('event_user', msg);
  	});
  	socket.on('event_provider', function(msg){
    	io.emit('event_provider', msg);
  	});
});

/*
	VARIABLES DECLARATION
*/
var blockchainUri = 'http://192.168.1.102:8545';
// REGISTRATION SMART CONTRACT
var rcAddr = '0xf91a630295681c450fe1bc74046d876eca7706c5';
var rcAbi = [ { "constant": true, "inputs": [ { "name": "", "type": "bytes32" } ], "name": "lookupTable", "outputs": [ { "name": "scName", "type": "string" }, { "name": "subject", "type": "address" }, { "name": "object", "type": "address" }, { "name": "creator", "type": "address" }, { "name": "scAddress", "type": "address" }, { "name": "abi", "type": "bytes" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_methodName", "type": "string" }, { "name": "_scName", "type": "string" } ], "name": "methodScNameUpdate", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_methodName", "type": "string" }, { "name": "_scname", "type": "string" }, { "name": "_subject", "type": "address" }, { "name": "_object", "type": "address" }, { "name": "_creator", "type": "address" }, { "name": "_scAddress", "type": "address" }, { "name": "_abi", "type": "bytes" } ], "name": "methodRegister", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "_methodName", "type": "string" } ], "name": "getContractAddr", "outputs": [ { "name": "_scAddress", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_methodName", "type": "string" }, { "name": "_abi", "type": "bytes" } ], "name": "methodaAbiUpdate", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_methodName", "type": "string" }, { "name": "_scAddress", "type": "address" } ], "name": "methodAcAddressUpdate", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_oldName", "type": "string" }, { "name": "_newName", "type": "string" } ], "name": "methodNameUpdate", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "_str", "type": "string" } ], "name": "stringToBytes32", "outputs": [ { "name": "", "type": "bytes32" } ], "payable": false, "stateMutability": "pure", "type": "function" }, { "constant": true, "inputs": [ { "name": "_methodName", "type": "string" } ], "name": "getContractAbi", "outputs": [ { "name": "_abi", "type": "bytes" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_name", "type": "string" } ], "name": "methodDelete", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" } ];

var rcInstance;
app.use(function(req,res,next) {
    var _send = res.send;
    var sent = false;
    res.send = function(data) {
        if(sent) return;
        _send.bind(res)(data);
        sent = true;
    };
    next();
});


// Define the context
app.use(express.static(__dirname + '/'));

// define page access
app.get('/',function(req,res){
  //res.sendFile(path.join(__dirname+'/user01.html'));
  res.sendFile(__dirname + '/index.html');
});

// define page access
app.get('/user01',function(req,res){
  //res.sendFile(path.join(__dirname+'/user01.html'));
  res.sendFile(__dirname + '/user01.html');
});

// define page access
app.get('/provider',function(req,res){
  //res.sendFile(path.join(__dirname+'/provider01.html'));
  res.sendFile(__dirname + '/provider.html');
});

// define page access
app.get('/smart-home01',function(req,res){
  //res.sendFile(path.join(__dirname+'/smart-home01.html'));
  res.sendFile(__dirname + '/smart-home01.html');
});

app.get('/getTarget', function(req, res) {
	if (req.method == 'GET') {
        var body = '';
        req.on('data', function (data) {
            body += data;
            if (body.length > 1e6)
                req.connection.destroy();
        });
        req.on('end', function () {
            res.status(200).json({
						status: 0,
						targets: getTarget()
			});
        });
    }
});

app.post('/getResources', function(req, res) {
	if (req.method == 'POST') {
        var body = '';
        req.on('data', function (data) {
            body += data;
            if (body.length > 1e6)
                req.connection.destroy();
        });
        req.on('end', function () {
			var getData = qs.parse(body);
        	var targetName = getData['targetName'];
            res.status(200).json({
						status: 0,
						resources: getResources(targetName)
			});
        });
    }
});

app.post('/getActions', function(req, res) {
	if (req.method == 'POST') {
        var body = '';
        req.on('data', function (data) {
            body += data;
            if (body.length > 1e6)
                req.connection.destroy();
        });
        req.on('end', function () {
        	var getData = qs.parse(body);
        	var resourcesName = getData['resourcesName'];
            res.status(200).json({
						status: 0,
						actions: getActions(resourcesName)
			});
        });
    }
});
/*
app.post('/sendRequest', function(req, res) {
	if (req.method == 'POST') {
        var body = '';
        req.on('data', function (data) {
            body += data;
            if (body.length > 1e6)
                req.connection.destroy();
        });
        req.on('end', function () {
        	var getData = qs.parse(body);
        	var resourcesName = getData['resourcesName'];
        	var actionsName = getData['actionsName'];
        	var methodName = getData['methodName'];
        	var subjectAddr = getData['subjectAddr'];
			if(!rcInstance) {
				var provider;
				if (typeof web3 !== 'undefined') {
					provider = web3.currentProvider;
				} else {
					//provider = new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/bfa2b1df92054ef49a7365bd064f696c");
					provider = new Web3(new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws'));
				}
				var web3 = new Web3(provider);
			}

			rcInstance = web3.eth.contract(rcAbi).at(rcAddr);
			var accAddr = rcInstance.getContractAddr(methodName);
			var accAbiBytes = rcInstance.getContractAbi(methodName);

			var accInstance = web3.eth.contract(JSON.parse(web3.toAscii(accAbiBytes))).at(accAddr);
			console.log(formatted+' '+'accInstance of on ACC: '+accInstance);
			var accEvent = accInstance.ReturnAccessResult({_from: subjectAddr},{from: 'latest'});
			var previousTxHash = 0;
			var currentTxHash = 0;
			var currentTime = new Date().getTime()/1000;
			currentTxHash = accInstance.accessControl.sendTransaction(
				resourcesName,
				actionsName,
				currentTime,
				{from: subjectAddr, gas: 3000000});
	        accEvent.watch(function(err, result) {
	            if(!err) {
					if (result.args._penalty > 0) {
						res.status(200).json({
							status: 2,
							address: result.address,
							blockNumber: result.blockNumber,
							transactionHash: result.transactionHash,
							blockHash: result.blockHash,
							time: result.args._time.toNumber(),
							message: result.args._errmsg,
							result: result.args._result,
							penalty: result.args._penalty
						});
					} else {
						res.status(200).json({
							status: 0,
							address: result.address,
							blockNumber: result.blockNumber,
							transactionHash: result.transactionHash,
							blockHash: result.blockHash,
							time: result.args._time.toNumber(),
							message: result.args._errmsg,
							result: result.args._result
						});
					}
	        	} else {
	        		// error
	        		console.error("[server-sendRequest] Error: "+err);
	        		res.status(200).json({
						status: 1
					});
	        	}
	      	});
        });
    }
});
*/
function getTarget() {
	var targets = [
		   {
		      "text":"Bedroom 1",
		      "value":"Bedroom 1",
		      "selected":true
		   },
		   {
		      "text":"Bedroom 2",
		      "value":"Bedroom 2"
		   },
		   {
		      "text":"Smart meter",
		      "value":"Smart meter"
		   }
		];
	return targets;
}

function getResources(target) {
	var devices;
	if(target == 'Bedroom 1') {
		devices = [
					  {
					    "text"  : "Door 1",
					    "value" : "Door 1",
					    "selected" : true
					  },
					  {
					    "text"     : "Lighting 1",
					    "value"    : "Lighting 1"
					  },
					  {
					    "text"  : "Fan 1",
					    "value" : "Fan 1"
					  }
					];
	} else if(target == 'Bedroom 2') {
		devices = [
					  {
					    "text"  : "Door 2",
					    "value" : "Door 2",
					    "selected" : true
					  },
					  {
					    "text"     : "Lighting 2",
					    "value"    : "Lighting 2"
					  },
					  {
					    "text"  : "Fan 2",
					    "value" : "Fan 2"
					  }
					];
	} else {
		devices = [
					  {
					    "text"  : "Water sensor",
					    "value" : "Water sensor",
					    "selected" : true
					  },
					  {
					    "text"     : "Power sensor",
					    "value"    : "Power sensor"
					  }
					];
	}
	return devices;
}

function getActions(resourcesName) {
	var actions;
	if(resourcesName == 'Door 1') {
		actions = [
					  {
					    "text"     : "Open",
					    "value"    : "Open",
					    "selected" : true
					  },
					  {
					    "text"  : "Close",
					    "value" : "Close"
					  }
					];
	} else if(resourcesName == 'Door 2') {
		actions = [
					  {
					    "text"     : "Open",
					    "value"    : "Open",
					    "selected" : true
					  },
					  {
					    "text"  : "Close",
					    "value" : "Close"
					  }
					];
	} else if(resourcesName == 'Lighting 1') {
		actions = [
					  {
					    "text"     : "Turn on",
					    "value"    : "Turn on",
					    "selected" : true
					  },
					  {
					    "text"  : "Turn off",
					    "value" : "Turn off"
					  }
					];
	} else if(resourcesName == 'Lighting 2') {
		actions = [
					  {
					    "text"     : "Turn on",
					    "value"    : "Turn on",
					    "selected" : true
					  },
					  {
					    "text"  : "Turn off",
					    "value" : "Turn off"
					  }
					];
	} else if(resourcesName == 'Fan 1') {
		actions = [
					  {
					    "text"     : "Turn on",
					    "value"    : "Turn on",
					    "selected" : true
					  },
					  {
					    "text"  : "Turn off",
					    "value" : "Turn off"
					  }
					];
	} else if(resourcesName == 'Fan 2') {
		actions = [
					  {
					    "text"     : "Turn on",
					    "value"    : "Turn on",
					    "selected" : true
					  },
					  {
					    "text"  : "Turn off",
					    "value" : "Turn off"
					  }
					];
	} else if(resourcesName == 'Water sensor') {
		actions = [
					  {
					    "text"  : "Read data",
					    "value" : "Read data",
					    "selected" : true
					  }
					];
	} else {
		// Power sensor
		actions = [
					  {
					    "text"  : "Read data",
					    "value" : "Read data",
					    "selected" : true
					  }
					];
	}
	return actions;
}

var accAddrInitialized = false;
//var accAddr02Initialized = false;

app.post('/initSmartHome', function(req, res) {
	if (req.method == 'POST') {
        var body = '';
        req.on('data', function (data) {
            body += data;
            if (body.length > 1e6)
                req.connection.destroy();
        });
        req.on('end', function () {
        	var getData = qs.parse(body);
        	var methodName01 = getData['methodName01'];
        	var methodName02 = getData['methodName02'];

			if(!rcInstance) {
				if (typeof web3 !== 'undefined') {
				    blockchainProvider = web3.currentProvider;
				    web3 = new Web3(blockchainProvider);
			    } else {
			        //blockchainProvider = new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/bfa2b1df92054ef49a7365bd064f696c");
							//blockchainProvider = new Web3(new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws'));
							blockchainProvider = new Web3('wss://ropsten.infura.io/ws');
			    }
					web3 = new Web3(blockchainProvider);
					rcInstance = web3.eth.contract(rcAbi).at(rcAddr);
					console.log('Provider initialized');
			}
			var contractNumbers = ['NTM.ND.001'];
			var i;
			for (i = 0; i < contractNumbers.length; i++) {
			    var methodName = contractNumbers[i];
			    try {
			    	// ACC
					var accAddr = rcInstance.getContractAddr(methodName);
					var accAbiBytes = rcInstance.getContractAbi(methodName);
					var accInstance = web3.eth.contract(JSON.parse(web3.toAscii(accAbiBytes))).at(accAddr);
					var accEvent = accInstance.ReturnAccessResult({},{fromBlock: 4142891, toBlock: 'latest'});
					console.log(formatted+' '+'Listening event on ACC: '+accInstance);
					accAddrInitialized = true;

			    } catch(err) {
			    	console.error(err);
			    }
			    if(accAddrInitialized) {
					accEvent.watch(function(err, result) {
						console.log(formatted+' '+'accAddrInitialized: '+ accAddrInitialized);
						if(!err) {
							var msg = '';
							msg += "Contract: " + result.address+"\n";
							msg += "Block Number: " + result.blockNumber+"\n";
							msg += "Tx Hash: " + result.transactionHash+"\n";
							msg += "Block Hash: " + result.blockHash+"\n";
							msg += "Subject: "+ result.args._from+"\n";
							msg += "Time: " + result.args._time.toNumber()+"\n";
							msg += "Message: " + result.args._errmsg+"\n";
							msg += "Result: " + result.args._result+"\n";
							if (result.args._penalty > 0)
								msg += "Requests are blocked for " + result.args._penalty + " minutes!"+"\n";
							msg += "\n";
							console.log(formatted+' [EVENT]:\n'+msg);
							io.emit('event_user', msg, result.args._from);
						} else{
								console.log(formatted+ ' ' +err);
						}
					})
				}

			}
			console.log(formatted+' [initSmartHome] Finished!');
			res.status(200).json({
				status: 0
			});
        });
    }
});

var port = process.env.PORT || 8080;
http.listen(port, function() {
  console.log(formatted+' SERVER is now running on ' + port);
});
