window.Sjakkapp = window.Sjakkapp || {}

// message.
Sjakkapp.network = function(msg, env, id) {

    // Disregard invalid messages (i.e.: messages lacking a command or user parameter). 
    if (typeof msg.command === 'undefined') return
    if (typeof msg.user === 'undefined') return

    // Get the game information for this game channel.
    if (id != Parse.User.current().id) {
        var game = Sjakkapp.Games.get(id)
        if (typeof game === 'undefined') return
    }

    switch(msg.command) {

        case "MOVE":
            if (msg.user == Parse.User.current().id) return  // Disgard our own messages.
            if (typeof msg.move === 'undefined') return                   // Move command with no move?
            game.Chess.move({from: msg.move.from, to: msg.move.to})
            game.set('Turn', game.Chess.turn())
            game.set('State', game.Chess.fen())
            game.increment('Moves')

            var board = $("#board")

            if (board.length && board.data('game') == id) {
                game.Board.position(game.Chess.fen())

            } else if (Sjakkapp.currentView == "games") { 
                new JST['Games']({model: Parse.User.current()}) 
            }
            break
        
        case "GAME":
            var query = new Parse.Query("Game")
            query.include("White", "Black")
            query.get(msg.game).then(function(game) {

                // Determine whether we're playing white or black.
                if (Parse.User.current().get('username') == game.get('White').get('username')) {
                    game.currentColor = 'w'
                    game.opponent = game.get('Black')
                } else {
                    game.currentColor = 'b'
                    game.opponent = game.get('White')
                }
                
                Sjakkapp.prompt("game-request", game, 2).then(function(dialog, game) {
                    game = dialog.getData('game')
                    var index = Sjakkapp.load(game)
                    Sjakkapp.pn.publish({
                        channel: game.id,
                        message: { user: Parse.User.current().get('username'), command: 'ACCEPT' }
                    })  
                    dialog.close()                    
                }, function(dialog) {
                    game = dialog.getData('game')
                    Sjakkapp.pn.publish({
                        channel: game.id,
                        message: { user: Parse.User.current().get('username'), command: 'DECLINE' }
                    }) 
                    dialog.close()
                })

                if (Sjakkapp.currentView == "games") { 
                    new JST['Games']({model: Parse.User.current()}) 
                }
            })
            break
        case "ACCEPT":
            if (Sjakkapp.Dialog) { 
                Sjakkapp.Dialog.close()
                new JST['Game']({ game: game })
            }
            break
        case "DECLINE":
            Sjakkapp.pn.unsubscribe({channel: game.id})
            Sjakkapp.Games.remove(game)
            game.destroy()
            if (Sjakkapp.Dialog) {
                Sjakkapp.Dialog.setMessage("Sorry, your game request was rejected...")
            }
            break
        case "PING":
            Sjakkapp.pn.publish({
                channel: msg.user,
                message: {
                    user: Parse.User.current().id,
                    command: 'PONG',
                }
            })
            Sjakkapp.Social.update(msg.user)
            break
        case "PONG":
            Sjakkapp.Social.update(msg.user)
            break
        case "QUIT":
            Sjakkapp.Social.update(msg.user, "quit")
            break
        case "CHAT":
            
            // Ugly solution. Find some other way to do this.

            chatpanel = $("div.chat ul.chat").find("li").first()

            var html = $(chatpanel).html()
            html = html.replace("%nickname%", msg.nickname)
            html = html.replace("%content%", msg.content)
            html = html.replace("%timestamp%", Math.round(new Date().getTime()/1000))
            $(chatpanel).after(html)
            break
    }

}

    
