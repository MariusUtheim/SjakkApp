window.Sjakkapp = window.Sjakkapp || {}
// new. 
Sjakkapp.new = function(opponent_id) {
    var opponent = new Parse.Object("User")
    var Game = new Parse.Object("Game")              

    // At this point, the opponent object is just a pointer to the user that we want. But this is
    // okay. When we refetch the game object from Parse after having saved it, the full data for
    // the opponent will also be retrieved.
    opponent.id = opponent_id
            
    // Randomly decide which player goes first. 
    if (Math.round(Math.random())) {
        Game.set('White', Parse.User.current())
        Game.set('Black', opponent)
    } else {
        Game.set('White', opponent)
        Game.set('Black', Parse.User.current())
    }

    // Save the newly created game object, then fetch it back from Parse. We need to do it this way
    // to make parse include the full object for both players (and not just their parse pointers)
    Game.save(null).then(function(game) {
        query = new Parse.Query("Game")
        query.equalTo("objectId", game.id)
        query.include("White", "Black")
        return query.first()
    }).then(function(game) {
        Sjakkapp.load(game)
        new JST['Game']({ game: game })

        // Send the challenge to the opponent (if he's online)
        Sjakkapp.pn.publish({
            channel: game.opponent.get('username'),
            message: {
                user: Parse.User.current().get('nickname'),
                command: 'GAME',
                game: game.id
            }
        })
    }) 
    
}