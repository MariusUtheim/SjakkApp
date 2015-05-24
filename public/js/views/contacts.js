$(document).on("templateLoaded", function(event, template) {

    if (template != "contacts-tpl") return

    JST = window.JST || {}
    JST['Contacts'] = Parse.View.extend({
        template: Handlebars.compile($('#contacts-tpl').html()),
        events: {
            "click #cmdPlayOpponent": "playOpponent"
        },
        playOpponent: function(e) {
            new JST['Loading']()
            var opponent = $(e.target).parent().parent().data('id')
            Sjakkapp.new(opponent)
        },
        initialize: function() {
            Sjakkapp.currentView = "contacts"
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