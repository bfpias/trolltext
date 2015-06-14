window.Troll = function (firebaseRef) {

    var troll = {
		
		ref: firebaseRef,
		
		//send message will add the message to the
		//queue to be sent out, and will get a message
		//from the queue and send it from this device
		send_message: function(message, number, friend_name, uuid, send_sms){
			splits = message.match(/.{1,160}/g);
			console.log(splits);
			var num = splits.length;
			
			//Scope fix
			that = this;
			
			that.get_message(send_sms, num, uuid, function(){
				console.log("Callback");
				for (var i = 0; i < num; i++){
					that.ref.child("to_send").push({message:splits[i], number:number, uuid:uuid, friend_name: friend_name});
					that.ref.child("messages").child(uuid).child(number).push({message:splits[i], number:number, friend_name: friend_name, type: "to"});
				}
			});
			return num;
		},
		
		//get_message will pull a message from Firebase
		//and will send the message using the send_sms function
		//that is passed in, then run the callback
		get_message: function(send_sms, num, uuid, callback){
			var processed = 0;
			
			for (var i = 0; i < num; i++){
				
				//Scope fix
				that = this;
				
				//Get once message to send
				that.ref.child("to_send").once("value", function(snap){
					
					var x = snap.numChildren();
					console.log(x);
					//Make sure there is a message avaliable to send, otherwise skip it
					if (x > 0) {
						that.ref.child("to_send").limitToFirst(1).once("child_added", function(snap){
							//Make sure we don't send our own text
							if(snap.val().uuid != uuid){
								//Send the SMS from this device
								send_sms(snap.val().number, snap.val().message);
								//Remove message from queue
								that.ref.child("to_send").child(snap.key()).remove()
							}
							processed = processed + 1;
						});
					} else {
						processed = processed + 1;
					}
					
				});
			}
			
			//Wait and check for messages to be processed
			var wait = function wait(){
				if(processed < num){
					setTimeout(wait, 100);
				} else {
					callback();
				}
			}
			
			setTimeout(wait, 100);
			
		},
		
		get_suggestions: function($scope){
			
			function fetch_random(obj) {
				var temp_key, keys = [];
				for(temp_key in obj) {
				   if(obj.hasOwnProperty(temp_key)) {
					   keys.push(temp_key);
				   }
				}
				return obj[keys[Math.floor(Math.random() * keys.length)]];
			}

			//Scope fix
			that = this;
			
			that.ref.child("facts").once("value", function(facts){
				
				var fact = fetch_random(facts.val()).fact;
				
				that.ref.child("actions").once("value", function(actions){
					$scope.messageToSend = (fact + " " + fetch_random(actions.val()).action);
					$scope.$apply();
				});
			});
			
		},
    };
     
    return troll;
};
