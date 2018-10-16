var Web3 			= require('web3');
var web3;

/*
DEFINE
*/
var blockchainUri = 'https://ropsten.infura.io/v3/bfa2b1df92054ef49a7365bd064f696c';
var rcAddr = '0xf91a630295681c450fe1bc74046d876eca7706c5';
var rcAbi = [ { "constant": true, "inputs": [ { "name": "", "type": "bytes32" } ], "name": "lookupTable", "outputs": [ { "name": "scName", "type": "string" }, { "name": "subject", "type": "address" }, { "name": "object", "type": "address" }, { "name": "creator", "type": "address" }, { "name": "scAddress", "type": "address" }, { "name": "abi", "type": "bytes" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_methodName", "type": "string" }, { "name": "_scName", "type": "string" } ], "name": "methodScNameUpdate", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_methodName", "type": "string" }, { "name": "_scname", "type": "string" }, { "name": "_subject", "type": "address" }, { "name": "_object", "type": "address" }, { "name": "_creator", "type": "address" }, { "name": "_scAddress", "type": "address" }, { "name": "_abi", "type": "bytes" } ], "name": "methodRegister", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "_methodName", "type": "string" } ], "name": "getContractAddr", "outputs": [ { "name": "_scAddress", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_methodName", "type": "string" }, { "name": "_abi", "type": "bytes" } ], "name": "methodaAbiUpdate", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_methodName", "type": "string" }, { "name": "_scAddress", "type": "address" } ], "name": "methodAcAddressUpdate", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_oldName", "type": "string" }, { "name": "_newName", "type": "string" } ], "name": "methodNameUpdate", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "_str", "type": "string" } ], "name": "stringToBytes32", "outputs": [ { "name": "", "type": "bytes32" } ], "payable": false, "stateMutability": "pure", "type": "function" }, { "constant": true, "inputs": [ { "name": "_methodName", "type": "string" } ], "name": "getContractAbi", "outputs": [ { "name": "_abi", "type": "bytes" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_name", "type": "string" } ], "name": "methodDelete", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" } ];


function sendRequestToBC(resourceName, actionName, methodName, callback) {
	var provider;
	if (window.web3.currentProvider) {
		provider = window.web3.currentProvider;
	} else {
		//provider = new web3.providers.HttpProvider(blockchainUri);
		provider = new Web3(new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws'));
	}
	var web3 = new Web3(provider);

	console.log('DEFAULT ETH ACC: '+web3.eth.accounts[0]);
	var subjectAddr = web3.eth.accounts[0];

	var rcInstance = web3.eth.contract(rcAbi).at(rcAddr);

	rcInstance.getContractAddr(methodName, function(err, data) {
		if(!err) {
			var accAddr = data;
			rcInstance.getContractAbi(methodName, function(err, data) {
				if(!err) {
					var accAbiBytes = data;
					var accInstance = web3.eth.contract(JSON.parse(web3.toAscii(accAbiBytes))).at(accAddr);
					var accEvent = accInstance.ReturnAccessResult({_from: subjectAddr},{from: 'latest'});
					var previousTxHash = 0;
					var currentTxHash = 0;
					var currentTime = new Date().getTime()/1000;

					accInstance.accessControl.sendTransaction(
						resourceName,
						actionName,
						currentTime,
						{from: subjectAddr, gas: 3000000}, function(err, data) {
	                   	if (!err)
	                        currentTxHash = data;
	                        console.warn('currentTxHash='+currentTxHash)
	                        // watch
							accEvent.watch(function(err, result) {
							    if(!err) {
							    	if(previousTxHash != result.transactionHash
							    		&& currentTxHash == result.transactionHash) {
										if (result.args._penalty > 0) {
											console.warn('callback status 2');
											callback({
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
											console.warn('currentTxHash='+currentTxHash)
											console.warn('blockHash='+result.blockHash)
											console.warn('transactionHash='+result.transactionHash)
											console.warn('penalty: '+result.args._penalty);
											console.warn('callback status 0');
											callback({
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
										previousTxHash = result.transactionHash;
									}
								} else {
									// error
									console.warn('callback status 1');
									console.error("[server-sendRequest] Error: "+err);
									callback({
										status: 1
									});
								}
							});

	                    });
				} else {
					console.error(err);
				}
			});
		} else {
			console.error(err);
		}
	});
}

function initSmartHomeToBC() {
    var provider;
	if (window.web3.currentProvider) {
		provider = window.web3.currentProvider;
	} else {
		//provider = new web3.providers.HttpProvider(blockchainUri);
		provider = new Web3(new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws'));
	}
	var web3 = new Web3(provider);
	var rcInstance = web3.eth.contract(rcAbi).at(rcAddr);
	console.log('rcInstance: '+rcInstance);
    var contractNumbers = ['NTM.ND.001','NTM.DV.002','NTM.ND.003','NTM.DV.004'];

    var i;
    for (i = 0; i < contractNumbers.length; i++) {
        var methodName = contractNumbers[i];
        try {
            // ACC
            rcInstance.getContractAddr(methodName, function(err, data) {
                if(!err) {
										var accAddr =  data;
                    rcInstance.getContractAbi(methodName, function(err, data) {
                        if(!err) {
													var accAbiBytes = data;
                            var accInstance = web3.eth.contract(JSON.parse(web3.toAscii(accAbiBytes))).at(accAddr);
														//var accInstance = web3.eth.contract(JSON.parse(hexToString(accAbiBytes))).at(accAddr);
                            var accEvent = accInstance.ReturnAccessResult({fromBlock: 0, toBlock: 'latest'});
                            console.log('Listening event on ACC: '+accAddr);
                            accEvent.watch(function(err, result) {
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
                                        console.log('[EVENT]:\n'+msg);
																				var textarea_event_user = document.getElementById('event_user');
																				textarea_event_user.value += msg;
																				textarea_event_user.scrollTop = textarea_event_user.scrollHeight;
                                    }
                            })
                        } else {
                            console.error(err);
                        }
                    });
                } else {
                    console.error(err);
                }
            });
        } catch(err) {
            console.error(err);
        }
    }
    console.log('[initSmartHome] Finished!');
}


function hexToString (hex) {
    var string = '';
    for (var i = 0; i < hex.length; i += 2) {
      string += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return string;
}
