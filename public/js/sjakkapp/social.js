window.Sjakkapp = window.Sjakkapp || {}

Sjakkapp.Social = Sjakkapp.Social || {}

Sjakkapp.Social.init = function() {

	Sjakkapp.Social.friends = new Parse.Collection("User")	// Create this in case there are no relations or the relation call fails. 
    Sjakkapp.Social.timer = setInterval("Sjakkapp.Social.broadcast('PING')", 60000)	// Check the online/offline state of all friends every 60th second.

    // Fetch all friends for the current user, and then 1) prompt them for their state and 2) tell everyone we're online.
    Parse.User.current().relation("friends").query().find(function(friends) {
        Sjakkapp.Social.friends = new Parse.Collection(friends)	// Overwrite the empty collection set above.
    	Sjakkapp.Social.broadcast('PING')						// prompt everyone else for their online state
    })

    $(window).on('beforeunload', function() {
    	Sjakkapp.Social.broadcast("QUIT")
    })
}

Sjakkapp.Social.broadcast = function(command) {
	Sjakkapp.Social.friends.each(function(friend) {
		Sjakkapp.pn.publish({
	        channel: friend.id,
	        message: {
	        	user: Parse.User.current().id,
	            command: command,
	        }
	    })
	})
	if (command=="PING") {
		setTimeout("Sjakkapp.Social.checkState()", 3000)
	}
}

Sjakkapp.Social.checkState = function() {
	Sjakkapp.Social.friends.each(function(friend) {
		if (!Sjakkapp.Social.isOnline(friend)) {
			$(".state."+friend.id).css('visibility', 'hidden')
		} else {
			$(".state."+friend.id).css('visibility', 'visible')			
		}
	})
}
Sjakkapp.Social.update = function(id, type) {
	var friend = Sjakkapp.Social.friends.get(id)
	if (typeof friend !== 'undefined') {
		if (typeof type === 'undefined') {
			friend.lastPong = Math.round(new Date().getTime() / 1000)
		} else if (type == "quit") {
			friend.lastPong = 0
		}
		Sjakkapp.Social.checkState()		
	}
}

Sjakkapp.Social.annotatedFriends = function() {
	var af = []
	Sjakkapp.Social.friends.each(function(friend) {
		var f = friend.toJSON()
		f.isOnline = Sjakkapp.Social.isOnline(f.objectId)
		af.push(f)
	})
	return af
}
Sjakkapp.Social.isOnline = function(id) {
	var friend = Sjakkapp.Social.friends.get(id)
	
	if (typeof friend !== 'undefined' && friend.hasOwnProperty('lastPong')) {
		var now = Math.round(new Date().getTime() / 1000)
		if (now - friend.lastPong < 60) return true
	}
	return false
}

Sjakkapp.Social.isFriend = function(id) {
	return typeof Sjakkapp.Social.friends.get(id) !== 'undefined'
}