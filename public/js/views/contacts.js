$(document).on("templateLoaded", function(event, template) {

    if (template != "contacts-tpl") return

    JST = window.JST || {}
    JST['Contacts'] = Parse.View.extend({
        template: Handlebars.compile($('#contacts-tpl').html()),
        events: {
            "click #cmdPlayOpponent": "playOpponent"
        },
        playOpponent: function(e) {
            e.preventDefault()
            var opponent = $(e.target).closest("tr").data('id')
            var gametype = parseInt($(e.target).parent().find("select").val())
            Sjakkapp.new(opponent, gametype)
        },
        initialize: function() {
            Sjakkapp.currentView = "contacts"
            /*
            if (typeof this.collection !== 'undefined') { return }
            var query = new Parse.Query("User")

            query.notEqualTo("username", Parse.User.current().get("username"))

            query.find({
                success: function(players) {
                    players.forEach(function(player) {
                        player.isFriend = Sjakkapp.Social.isFriend(player.id)
                        player.isOnline = Sjakkapp.Social.isOnline(player.id)
                    })
                    var View = new JST['Contacts']({model: Parse.User.current(), collection: players})
                    View.render()
                }
            })
            */

            this.render()
        },
        render: function() { 
            $(document).trigger('templateChange')
            if (Sjakkapp.Social.friends.length) {
                var context = { player: Sjakkapp.Social.annotatedFriends(), user: Parse.User.current().toJSON() }
            } else {
                var context = { user: Parse.User.current().toJSON() }
            }
            this.$el.html(this.template(context));
            $("#content").html(this.el);
            return this
        }
    })    
})