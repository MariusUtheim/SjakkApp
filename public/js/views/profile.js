$(document).on("templateLoaded", function(event, template) {

    if (template != "profile-tpl") return

    JST = window.JST || {}

    JST['Profile'] = Parse.View.extend({
        template: Handlebars.compile($("#profile-tpl").html()),
        initialize: function() {
            this.render()
        },
        render: function() {
            $(document).trigger('templateChange')            
            this.$el.html(this.template({user: this.model.toJSON()}))
            $("#content").html(this.el)
            return this
        }
    })

})