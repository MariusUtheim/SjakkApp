$(document).on("templateLoaded", function(event, template) {

    if (template != "login-tpl") return

    JST = window.JST || {}
    JST['Login'] = Parse.View.extend({
        template: Handlebars.compile($('#login-tpl').html()),
        events: {
            "submit .form-signin": "login",
            "click a": "signup"
        },
        login: function(e) {
            e.preventDefault()
            var data = $(e.target).serializeArray()
            var username = data[0].value
            var password = data[1].value
     
            Parse.User.logIn(username, password, {
                success: function(user) {
                    Sjakkapp.init()
                    new JST['Header']({model: user})
                    new JST['Loading']({model: user})
                    new JST['Games']({model: user})
                },
                error: function(user, error) {
                    $("#content").find("input[name='email']").parent().addClass('has-error')
                    $("#helpBlock").html(error.message)
                }
            });
        },
        signup: function(e) {   
            new JST['Signup']()
        },
        initialize: function() {
            this.render()
        },
        render: function() { 
            $(document).trigger('templateChange')
            this.$el.html(this.template()); 
            $("#content").html(this.el); 
            return this 
        }
    })
})