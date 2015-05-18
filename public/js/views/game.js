$(document).on("templateLoaded", function(event, template) {

    if (template != "game-tpl") return

    JST = window.JST || {}
    JST['Game'] = Parse.View.extend({
        template: Handlebars.compile($('#game-tpl').html()),   
        events: {
            "click #cmdChat": "chat"
        },
        chat: function(e) {
            e.preventDefault()
            $(".chatpanel").toggle()
        },
        initialize: function() {
            this.render()
        },
        render: function() {
            $(document).trigger('templateChange')

            var game = this.options.game

            var context = {
                user: Parse.User.current().toJSON(), 
                opponent: game.opponent.toJSON(), 
                game: game.toJSON() 
            }
            this.$el.html(this.template(context))
            $("#content").html(this.el);

            Sjakkapp.start(game)
            return this
        }
    })    
})