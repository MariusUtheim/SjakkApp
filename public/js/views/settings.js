$(document).on("templateLoaded", function(event, template) {

    if (template != "settings-tpl") return

    JST = window.JST || {}
    JST['Settings'] = Parse.View.extend({
        template: Handlebars.compile($('#settings-tpl').html()),
        initialize: function() {
            this.render()
        },
        render: function() { 
            $(document).trigger('templateChange')            
            this.$el.html(this.template({user: this.model.toJSON()})); 
            $("#content").html(this.el);
            return this
        }
    })    
})