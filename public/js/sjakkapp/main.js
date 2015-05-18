// Sjakkapp.js
// Development started May 2, 2015 .

var PN = PUBNUB
Parse.initialize("0NkZxSv180JSfRrQLMi1IJQ5ZkJNcEWfXQWYUMRJ", "Pqhg31UmkErdu0AePchENZ7MpC0sAzMhEqSKYvCU");

            String.prototype.toHHMMSS = function() {
                t = Number(this);
                var d = ('0' + Math.floor(t / 86400)).slice(-2)
                var h = ('0' + Math.floor(t % 86400 / 3600)).slice(-2);
                var m = ('0' + Math.floor(t % 3600 / 60)).slice(-2);
                var s = ('0' + Math.floor(t % 3600 % 60)).slice(-2);
                if (!parseInt(d)) {
                    if (!parseInt(h)) {
                        if (!parseInt(m)) { return s }
                        return m + "m" + s + "s"
                    }
                    return h + "h" + m + "m" + s + "s"
                }
                return d + "d" + h + "h" + m + "m" + s + "s"
            }
            
$(document).ready(function() {


    // Invoke the loading animation view while we're waiting for the rest to load.
    var View = new JST['Loading']

    // Load external templates. For now, the way we do this is by iterating through every script element
    // with a 'template' type in the document body and fetching the corresponding template file through an
    // ajax call. When there are no more empty template script elements remaining, we'll trigger the
    // templatesLoaded event, subsequently loading the page into view for the client.

    templates = $("script[type='text/template']")

    $("script:empty[type='text/template']").each(function() {
        var id = $(this).attr('id')
        var path = 'templates/' + id.replace('-', '.')
        
        $.ajax({
            url: path, 
            context: {id: id},
            success: function(data) {
                $("#"+id).html(data)
                $(document).trigger("templateLoaded", id)
                if (!$("script:empty[type='text/template']").length) { $(document).trigger('templatesLoaded') }
            }
        })
    })

})


            
// We'll need to declare the loading view here to make it immediately available to the DOM, so that the loading 
// animation can be properly displayed while the rest of the contents are being fetched. 

var JST = JST || {}

JST['Loading'] = Parse.View.extend({
    template: Handlebars.compile($("#loading-tpl").html()),
    initialize: function() { this.render() },
    render: function() { 
        this.$el.html(this.template())
        $("#content").html(this.el)
        return this
    }
})

$(document).on("templatesLoaded", function() {
    if (Parse.User.current()) {
        new JST['Header']({model: Parse.User.current()})
        new JST['Games']({model: Parse.User.current()})
        Parse.User.current().set('lastLogin', new Date())
    } else {
        new JST['Login']
    }
})
