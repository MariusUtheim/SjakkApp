$(document).on("templateLoaded", function(event, template) {

    if (template != "contacts-tpl") return

    JST = window.JST || {}
    JST['Contacts'] = Parse.View.extend({
        template: Handlebars.compile($('#contacts-tpl').html()),
        events: {
            "click #cmdPlayOpponent": "playOpponent"
        },
        playOpponent: function(e) {

            // Display the loading view while we're building the game object and fetching data from Parse.
            new JST['Loading']()

            var opponent = new Parse.Object("User")
            var Game = new Parse.Object("Game")              

            // At this point, the opponent object is just a pointer to the user that we want. But this is
            // okay. When we refetch the game object from Parse after having saved it, the full data for
            // the opponent will also be retrieved.
            opponent.id = $(e.target).parent().parent().data('id')
            
            // Randomly decide which player goes first. 
            if (Math.round(Math.random())) {
                Game.set('White', Parse.User.current())
                Game.set('Black', opponent)
            } else {
                Game.set('White', opponent)
                Game.set('Black', Parse.User.current())
            }

            // We might want to set these in the cloud? Actually, the above code could also be run in main.js
            Game.set('createdBy', Parse.User.current())
            Game.set('Turn', 'w')
            Game.set('State', "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")

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

                Sjakkapp.pn.publish({
                    channel: game.opponent.get('username'),
                    message: {
                        user: Parse.User.current().get('nickname'),
                        command: 'GAME',
                        game: game.id
                    }
                })

            })


        },
        initialize: function() {
            if (typeof this.collection !== 'undefined') { return }
            var query = new Parse.Query("User")

            query.notEqualTo("username", Parse.User.current().get("username"))

            query.find({
                success: function(players) {
                    var View = new JST['Contacts']({model: Parse.User.current(), collection: players})
                    View.render()
                }
            })
        },
        render: function() { 
            $(document).trigger('templateChange')
            if (typeof this.collection !== 'undefined') {
                var context = { player: this.collection, user: this.model.toJSON() }
            } else {
                var context = { user: this.model.toJSON() }
            }
            this.$el.html(this.template(context));
            $("#content").html(this.el);
            return this
        }
    })    
})