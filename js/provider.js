function getTarget() {
	$.ajax({
		url: '/getTarget',
		type:"GET",
		success: function(data) {
			console.log('[client] get target success: '+data.targets);
			var selectTargets = document.getElementById('targets');
			for(var i = 0, l = data.targets.length; i < l; i++) {
				var option = data.targets[i];
				selectTargets.options.add( new Option(option.text, option.value, option.selected) );
				if(option.selected) {
					getResources(option.text);
				}
			}
		}
	});
}

function getResources(target) {
	$.ajax({
		url: '/getResources',
		data:{
			targetName: target
		},
		dataType:"json",
		type:"POST",
		success: function(data) {
			console.log('[client] get resource success: '+data.resources);
			var selectResources = document.getElementById('resources');
			removeOptions(selectResources);
			for(var i = 0, l = data.resources.length; i < l; i++) {
				var option = data.resources[i];
				selectResources.options.add( new Option(option.text, option.value, option.selected) );
				if(option.selected) {
					getActions(option.text);
				}
			}
		}
	});
}

function getActions(resourcesName) {
	console.log('[client] get action from resource: '+resourcesName);
	$.ajax({
		url: '/getActions',
		data: {
			resourcesName: resourcesName
		},
		dataType:"json",
		type:"POST",
		success: function(data) {
			console.log('[client] get action success: '+data.actions);
			var selectActions = document.getElementById('actions');
			removeOptions(selectActions);
			for(var i = 0, l = data.actions.length; i < l; i++) {
				var option = data.actions[i];
				selectActions.options.add( new Option(option.text, option.value, option.selected) );
			}
			showLevel(selectActions.options[selectActions.selectedIndex].value);
		}
	});
}

function onChangeTargets() {
	var selectedTarget = document.getElementById("targets").value;
    console.log('[client] selected target: '+selectedTarget);
    getResources(selectedTarget);
}

function onChangeResources() {
	var selectedResource = document.getElementById("resources").value;
    console.log('[client] selected resource: '+selectedResource);
    getActions(selectedResource);
}

function onChangeActions() {
	var selectedAction = document.getElementById("actions").value;
	action = selectedAction;
    showLevel(selectedAction);
}

function showLevel(actionName) {
	console.log('onChangeActions: '+actionName);
	if(actionName == 'Turn on') {
    	document.getElementById("level").style.visibility = "visible";
    } else {
    	document.getElementById("level").style.visibility = "hidden";
    }
}

function removeOptions(selectbox)
{
    var i;
    for(i = selectbox.options.length - 1 ; i >= 0 ; i--)
    {
        selectbox.remove(i);
    }
}


function sendRequest() {
	document.getElementById("textarea_provider").value = '';
	swal({
	  title: "Send access request?",
	  text: "Do you want to send a request to access the device?",
	  icon: "warning",
	  buttons: true,
	  dangerMode: true,
	})
	.then((willDelete) => {
	  if (willDelete) {
		$("#WaitDialog").modalDialog();
		// call to RC
		var selectedResource = document.getElementById("resources").value;
		var selectedAction = document.getElementById("actions").value;
		$.ajax({
			url: '/sendRequest',
			data:{
				resourcesName: selectedResource,
				actionsName: selectedAction,
				/* Dia chi subject cua Provider (SP)*/
				methodName: 'Method 2',
				subjectAddr: '0x97Aaa8c70d927468A8004bDeC1E42ECa9c870B93'
			},
			dataType:"json",
			type:"POST",
			success: function(data) {
				console.log('[client-sendRequest] send Request success: '+data.status);
				if(data.status == 0){
					$("#WaitDialog").modalDialog("hide");
					if(data.result) {
						swal("Request successfully proccessed", {
						  icon: "success",
						});

					} else {
						swal(data.message, {
						  icon: "error",
						});
					}
					var result = 'Contract: '+data.address+'\n'
							+'Block Numbers: '+data.blockNumber+'\n'
							+'Tx Hash: '+data.transactionHash+'\n'
							+'Block Hash: '+data.blockHash+'\n'
							+'Time: '+data.time+'\n'
							+'Message: '+data.message+'\n'
							+'Result: '+data.result+'\n';
					document.getElementById("textarea_provider").value = result;
				} else if(data.status == 2) {
					$("#WaitDialog").modalDialog("hide");
					swal("Request are blocked for " + data.penalty + " minutes!", {
					  icon: "warning",
					});
					var result = 'Contract: '+data.address+'\n'
							+'Block Numbers: '+data.blockNumber+'\n'
							+'Tx Hash: '+data.transactionHash+'\n'
							+'Block Hash: '+data.blockHash+'\n'
							+'Time: '+data.time+'\n'
							+'Message: '+data.message+'\n'
							+'Result: '+data.result+'\n';
					document.getElementById("textarea_provider").value = result;
				} else {
					$("#WaitDialog").modalDialog("hide");
					swal("Something wrong in server", {
					  icon: "error",
					});
				}
			}
		});
	  } else {
		swal("You don't want to send the request!");
	  }
	});
}
