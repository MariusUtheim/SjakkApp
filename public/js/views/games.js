$(document).on("templateLoaded", function(event, template) {

    if (template != "games-tpl") return
    JST = window.JST || {}

    JST['Games'] = Parse.View.extend({
        template: Handlebars.compile($('#games-tpl').html()),
        events: {
            "click a.game": "game"
        },
        game: function(e) {
            e.preventDefault()
            new JST['Loading']
            var id = $(e.target).parent().parent().data('id')
            game = Sjakkapp.Games.get(id)
            new JST['Game']({game: game})
        },
        initialize: function() {

            if (typeof this.collection === 'undefined') {

                var Game = Parse.Object.extend("Game")

                var qWhite = new Parse.Query(Game)
                var qBlack = new Parse.Query(Game)

                qWhite.equalTo('White', Parse.User.current())
                qBlack.equalTo('Black', Parse.User.current())
                
                query = new Parse.Query.or(qWhite, qBlack)
                query.include("White", "Black")
                query.descending("updatedAt")

                var Games = Parse.Collection.extend({
                    model: Game,
                    query: query
                })

                var games = new Games()

                games.fetch({
                    success:function(games) {
                        var View = new JST['Games']({ collection: games, model: Parse.User.current() })
                        View.render()
                    },
                    error:function(games, error) {
                        console.log(error.message)
                    }
                })
                
                /*
                games.fetch().then(function(results) { 
                    console.log(results.length) 
                    return Parse.Cloud.run('getGameTime', { Game: Sjakkapp.Game.id, createdAt: Sjakkapp.Game.createdAt })
                }).then(function(results) {
                    console.log(results)
                })
                */
            }
        },
        render: function() {
            $(document).trigger('templateChange')            
            var game = this.collection.toJSON()
            
            for (i =0, l = game.length; i < l; i++) {
                b = this.collection.models[i].attributes.Black
                w = this.collection.models[i].attributes.White
                c = "White"
                c2 = 'w'
                o = b

                if (Parse.User.current().get('username') != w.get('username')) {
                    c = "Black"
                    c2 = 'b'
                    o = w
                }

                if (this.collection.models[i].get('Turn') == c2) {
                    game[i].isItMyTurn = true
                    s = "Your turn"
                } else {
                    game[i].isItMyTurn = false
                    s = "Opponent's turn"
                }

                if (this.collection.models[i].get('Gameover')) {
                    s = "Game over"
                    game[i].isItMyTurn = false
                }
                //game[i].Black.username = b.get('username')
                //game[i].White.username = w.get('username')

                game[i].Black = b.toJSON()
                game[i].White = w.toJSON()
                game[i].Opponent = o.toJSON()
                game[i].Color = c
                game[i].State = s

            }

            var context = { game: game, user: this.model.toJSON()}
            this.$el.html(this.template(context))
            $("#content").html(this.el)
        }
    })
})