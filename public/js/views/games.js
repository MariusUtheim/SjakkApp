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
            Sjakkapp.currentView = "games"
            this.render()
        },
        render: function() {
            $(document).trigger('templateChange')

            // Because of limitations in handlebars' variable logic, we need to do some preprocessing of the game object
            // before performing variable substitutions and rendering the page. We'll iterate through every active game 
            // in reverse order (so the most recent games will show up on top) and add a few properties to make them
            // available to handlebars.
            var game = []                       // this will be an array holding all our active games.
            var games = Sjakkapp.Games          // quick-reference.
            
            for (var i = games.length-1; i >= 0; i--) {
                game.push(games.at(i).toJSON())
                game[game.length-1].Opponent = games.at(i).opponent.get("nickname")
                game[game.length-1].Turn = (games.at(i).get("Turn") == Sjakkapp.Games.at(i).currentColor)
                game[game.length-1].White = (games.at(i).currentColor == "w")
            }

            var context = { game: game, user: Parse.User.current().toJSON() }
            this.$el.html(this.template(context))
            $("#content").html(this.el)
        }
    })
})