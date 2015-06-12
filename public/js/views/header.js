$(document).on("templateLoaded", function(event, template) {

    if (template != "header-tpl") return

    JST = window.JST || {}
    JST['Header'] = Parse.View.extend({
        template: Handlebars.compile($("#"+template).html()),
        events: {
            "click a#cmdLogo": "logo",
            "click li>a#cmdGames": "nav",
            "click li>a#cmdContacts": "nav",
            "click li>a#cmdSettings": "nav",
            "click #cmdProfile": "nav",
            "click #cmdLogout": "logout"
        },
        logo: function(e) {
            e.preventDefault()
            location.reload(true)
        },
        nav: function(e) {
            e.preventDefault()
            new JST['Loading']
            var dest = $(e.target).attr('id').substr(3)
            new JST[dest]({model: Parse.User.current()})
            $(e.target).parent().siblings().removeClass('active')
            $(e.target).parent().addClass('active')
        },        
        logout: function(e) {
            e.preventDefault()
            Sjakkapp.Social.broadcast("QUIT")
            Parse.User.logOut()
            $("#header").empty()
            new JST['Login']()
            location.reload(true)
        },        
        initialize: function() {
            this.render()
        },
        render: function() {
            $(document).trigger('templateChange')            
            this.$el.html(this.template({user: this.model.toJSON()}))
            $("#header").html(this.el)
            return this
        }
    })
})