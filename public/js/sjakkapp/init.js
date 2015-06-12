
// init
window.Sjakkapp = window.Sjakkapp || {}

Sjakkapp.init = function() {
    // Instantiate these variables, because they need to exist even if they're empty.
    Sjakkapp.Games = new Parse.Collection()
    Sjakkapp.Board = ""
    Sjakkapp.Chess = ""
    Sjakkapp.Dialog = {}
    Sjakkapp.currentView = ""

    // Set up PUBNUB. We have to do this before initializing any games, because otherwise they wouldn't be able
    // to properly set up their channel subscriptions. 
    Sjakkapp.pn = PN.init({
        publish_key: 'pub-c-cfc130e1-ad89-4333-a51f-abd7138a06ee',
        subscribe_key: 'sub-c-61984dba-f0d1-11e4-82cc-02ee2ddab7fe',
        uuid: Parse.User.current()
    });    

    // We'll use this channel for communicating between users outside of games.
    Sjakkapp.pn.subscribe({
        channel: Parse.User.current().id,
        message: function(message, env, ch) { Sjakkapp.network(message, env, ch) },
        ssl: true
    })

    Sjakkapp.Social.init()

    // Let's build a query to download all active games from the Parse DB. 
    var qWhite = new Parse.Query("Game")  // We're looking for all games in which the current user is playing white
    var qBlack = new Parse.Query("Game")  // ....or black

    qWhite.equalTo('White', Parse.User.current())
    qBlack.equalTo('Black', Parse.User.current())

    query = new Parse.Query.or(qWhite, qBlack)  // Combine both query objects into one
    query.notEqualTo('Gameover', true)          // Let's exclude inactive games
    query.notEqualTo('Accepted', true)          //
    query.include("White", "Black")             // Also fetch player information (e.g. username, nickname, etc.)
    query.ascending("updatedAt")

    var Games = Parse.Collection.extend({
        model: "Game",
        query: query
    })

    var games = new Games()

    games.fetch({
        success:function(games) {
            games.each(function(game) { 
                Sjakkapp.load(game)
            })
            new JST['Games']
        }
    })


}