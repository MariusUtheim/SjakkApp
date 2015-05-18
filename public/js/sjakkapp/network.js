window.Sjakkapp = window.Sjakkapp || {}

// message.
Sjakkapp.network = function(msg, env, id) {


    // Disregard our own messages.
    if (msg.sender == Parse.User.current().get('username')) return

    // Get the game information for this game channel.
    var game = Sjakkapp.Games.get(id)

    if (typeof msg.move !== 'undefined' && typeof game !== 'undefined' ) {
        game.Chess.move({from: msg.move.from, to: msg.move.to})
        game.set('Turn', game.Chess.turn())
        game.set('State', game.Chess.fen())
        game.increment('Moves')

        // Update the chess board if it's open.

        var board = $("#board")
        if (board.length && board.data('game') == id) {
            game.Board.position(game.Chess.fen())

        // Otherwise, just notify the user that an opponent made a move.

        } else {

            var notice = new PNotify({
                title: 'Just to let you know...',
                text: game.opponent.get('nickname') + " just moved. It's your turn!",
            });
            
            $(notice.elem).data('game', id)

            notice.get().click(function(e) {
                if ($(e.target).is('.ui-pnotify-closer *, .ui-pnotify-sticker *')) return;
                var id = $(this).data('game')
                var game = Sjakkapp.Games.get(id)
                new JST['Loading']
                new JST['Game']({game: game})
                this.remove()
            });
 
        }   
    }
}

    
