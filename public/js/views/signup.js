$(document).on("templateLoaded", function(event, template) {

    if (template != "signup-tpl") return

    JST = window.JST || {}
    JST['Signup'] = Parse.View.extend({
        template: Handlebars.compile($('#signup-tpl').html()),
        events: {
            "submit .form-signup": "signup",
            "click a": "signin"
        },
        signup: function(e) {
            e.preventDefault()
            var data = $(e.target).serializeArray()
            var username = data[0].value
            var password = data[1].value
            var user = new Parse.User()
            user.set('username', username)
            user.set('nickname', username)
            user.set('password', password)
            user.set('email', username)
            userACL = new Parse.ACL()
            userACL.setPublicReadAccess(true)

            Parse.User.signUp(username, password, { ACL: userACL }, {
                success: function(user) {
                    new JST['Header']({model: user})
                    new JST['Loading']({model: user})
                    new JST['Games']({model: user})    
                },
                error: function(user, error) {
                    $("#helpBlock").html(error.code + " " + error.message)
                    $("#content").find("input[name='email']").parent().addClass('has-error')
                }
            });
        },
        signin: function(e) {
            new JST['Login']()
        },
        initialize: function() {
            this.render()
        },
        render: function() {
            $(document).trigger('templateChange')
            this.$el.html(this.template())
            $("#content").html(this.el)
            return this 
        }
    })
})