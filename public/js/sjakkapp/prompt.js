window.Sjakkapp = window.Sjakkapp || {}

Sjakkapp.prompt = function(template, game, type) {
    var deferred = new $.Deferred();

    var source = "#" + template + "-dialog-tpl"
    var template = Handlebars.compile($(source).html())
    var title = $($(source).html()).filter("h1").html() || "Sjakkapp prompt"
	var context = {
		game: game.toJSON(),
        opponent: game.opponent.toJSON(), 
        user: Parse.User.current().toJSON() 
    }
    var content = template(context)

    if (type==1) {
    	var buttons = [{
    		label: "Close",
    		action: function(dialog) { deferred.resolve(dialog) }
    	}]
    } else if (type == 2) {
		var buttons = [{
            label: "Decline",
            icon: 'glyphicon glyphicon-ban-circle',
            action: function(dialog) {
            	deferred.reject(dialog)
			}
        },{
			label: 'Accept',
            icon: "glyphicon glyphicon-ok-circle",
            cssClass: 'btn-primary',
            action: function(dialog){
                deferred.resolve(dialog)
            }
        }]
	}

    Sjakkapp.Dialog = BootstrapDialog.show({
		title: title,
		closable: false,
		message: content,
		data: {'game': game},
		buttons: buttons
    });


    return deferred.promise()
}