window.Sjakkapp = window.Sjakkapp || {}
// load. 
Sjakkapp.load = function(game) {

    // Assign one Chess class to each game. This way we can simultaneously keep track of multiple games even if
    // only one game can be open in the game view at a time.
    game.Chess = new Chess(game.get('State'))

    // Determine whether we're playing white or black.
    if (Parse.User.current().get('username') == game.get('White').get('username')) {
        game.currentColor = 'w'
        game.opponent = game.get('Black')
    } else {
        game.currentColor = 'b'
        game.opponent = game.get('White')
    }

    Sjakkapp.Games.add(game)

    // Subscribe to the pubnub channel for this game.
    Sjakkapp.pn.subscribe({
        channel: game.id,
        message: function(message, env, ch) { Sjakkapp.network(message, env, ch) },
        ssl: true
    })    
    
}