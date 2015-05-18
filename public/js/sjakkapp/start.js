window.Sjakkapp = window.Sjakkapp || {}
// start
Sjakkapp.start = function(game) {

    // We want the chess board to be oriented with the player's own pieces at the bottom.
    var orientation = "white"
    if (game.currentColor != "w") orientation = "black"

    game.Board = new ChessBoard('board', {
        draggable: true,
        position: game.get('State'),
        orientation: orientation,       
        onDragStart: function(source, piece, position, orientation) {
            // Only allow picking up a piece under two conditions: 1) it's our turn and 2) it's our piece.
            var id = $("#board").data('game')
            var t = Sjakkapp.Games.get(id).Chess.turn()
            return (Sjakkapp.Games.get(id).currentColor == t && t == piece[0])
        },
        onDrop: function(source, target, piece, newpos, oldpos, orientation) {
            var id = $("#board").data('game')
            var game = Sjakkapp.Games.get(id)
            var chess = game.Chess
            var move = chess.move({
                from: source,
                to: target,
                promotion: 'q'
            })

            if (move === null) return 'snapback'

            game.set('State', chess.fen())
            game.set('Turn', chess.turn())
            game.increment('Moves')
            game.save()

            Sjakkapp.pn.publish({
                channel: id,
                message: {
                    sender: Parse.User.current().get('username'),
                    move: {from: source, to: target}
                }
            })

            // Also add the move to the movehistory
            var MoveHistory = Parse.Object.extend("MoveHistory")
            var moves = new MoveHistory()
            moves.save({
                'Game': game,
                'Color': game.currentColor,
                'From': source,
                'To': target,
                'Piece': piece
            })
        }
    });
}