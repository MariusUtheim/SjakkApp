$(document).on("templateLoaded", function(event, template) {

    if (template != "game-tpl") return

    JST = window.JST || {}
    JST['Game'] = Parse.View.extend({
        template: Handlebars.compile($('#game-tpl').html()),   
        events: {
            "click #cmdChat": "toggleChat",
            "keypress #btn-input": "chat"
        },
        toggleChat: function(e) {
            e.preventDefault()
            $(".chatpanel").toggle()
        },
        chat: function(e) {
            var keycode = (typeof e.which == "number") ? e.which : e.keyCode;
            var content = $(e.target).val()

            if (keycode == 13 && content.length) {
                Sjakkapp.pn.publish({
                    channel: $("#board").data('game'),
                    message: {
                        user: Parse.User.current().get('nickname'),
                        command: 'CHAT',
                        content: content
                    }
                })
                e.preventDefault()
                $(e.target).val("")
            }
            
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