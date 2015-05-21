window.Sjakkapp = window.Sjakkapp || {}

// message.
Sjakkapp.network = function(msg, env, id) {

    // Disregard invalid messages (i.e.: messages lacking a command or user parameter). 
    if (typeof msg.command === 'undefined') return
    if (typeof msg.user === 'undefined') return

    // Get the game information for this game channel.
    var game = Sjakkapp.Games.get(id)

    if (typeof game === 'undefined') return

    switch(msg.command) {
        case "MOVE":
            if (msg.user == Parse.User.current().get('username')) return  // Disgard our own messages.
            if (typeof msg.move === 'undefined') return                     // Move command with no move?
            game.Chess.move({from: msg.move.from, to: msg.move.to})
            game.set('Turn', game.Chess.turn())
            game.set('State', game.Chess.fen())
            game.increment('Moves')
            var board = $("#board")
            if (board.length && board.data('game') == id) {
                game.Board.position(game.Chess.fen())
            }
            break
        case "CHAT":
            
            // Ugly solution. Find some other way to do this.

            chatpanel = $("div.chat ul.chat").find("li").first()

            var html = $(chatpanel).html()
            html = html.replace("%nickname%", msg.user)
            html = html.replace("%content%", msg.content)
            html = html.replace("%timestamp%", Math.round(new Date().getTime()/1000))
            $(chatpanel).after(html)
            break
    }

}

    
