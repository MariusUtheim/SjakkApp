// Sjakkapp.js
// Development started May 2, 2015 .

// This is our self-instantiating master class that organizes most of the game logic. When a game is opened, 
// this class will store the objects of all the relevant classes. REMEMBER to remove this from the global scope
// before release.

(function( Sjakkapp, $, undefined ) { 

    // These variables are all set when initializing a new game.
    Sjakkapp.Game = Parse.Object.extend("Game")
    Sjakkapp.Chess = new Chess()
    Sjakkapp.Board = ""
    Sjakkapp.Players = {
        'White': Parse.Object.extend("User"),
        'Black': Parse.Object.extend("User")
    }
    Sjakkapp.timeElapsed = {
        'White': 0,
        'Black': 0,
        'lastMove': 0
    }
    Sjakkapp.currentColor = ""

    // For internal use only.
    Sjakkapp.timer = 0
    Sjakkapp.timerInterval = 500

    Sjakkapp.subscribe = function() { 
        Sjakkapp.timer = setInterval(function() { Sjakkapp.update() }, Sjakkapp.timerInterval) 
    }
    Sjakkapp.unsubscribe = function() {
        if (Sjakkapp.timer) {
            clearInterval(Sjakkapp.timer)
            Sjakkapp.timer = 0
        }
    }

    // Update. This function is invoked periodically (say every 500 milliseconds). We'll do a bunch of checks
    // to make sure we've got the latest game object in memory.
    Sjakkapp.update = function() {
        if (Sjakkapp.Chess.game_over()) { return }
        if (Sjakkapp.Chess.turn() != Sjakkapp.currentColor) {
            Sjakkapp.Game.fetch({
                success: function(game) {
                    Sjakkapp.Game = game
                    Sjakkapp.Chess.load(game.get('State'))
                    Sjakkapp.Board.position(game.get('State'))
                }
            })
            $("#helpBlock").html("It's your opponent's turn. ")
        } else {
            $("#helpBlock").html("It's your turn. ")
        }

        // How many seconds have elapsed since our last update?
        var secondsElapsed = Sjakkapp.timerInterval / 1000

        if (Sjakkapp.Chess.turn() == "w") {
            Sjakkapp.timeElapsed.White += secondsElapsed
        } else {
            Sjakkapp.timeElapsed.Black += secondsElapsed
        }
        var totalTimeElapsed = Sjakkapp.timeElapsed.White + Sjakkapp.timeElapsed.Black
        $("#helpBlock").append("Total time elapsed: " + String(totalTimeElapsed).toHHMMSS() + " (White: " + String(Sjakkapp.timeElapsed.White).toHHMMSS() + ", Black: "+ String(Sjakkapp.timeElapsed.Black).toHHMMSS()+")")
        Sjakkapp.checkState()
    }
    Sjakkapp.checkState = function() {
        if (Sjakkapp.Chess.game_over()) {
            var title, message
            if (Sjakkapp.Chess.turn() != Sjakkapp.currentColor) {
                title = "Congratulations!"
            } else {
                title = "Game over!"
            }
            if (Sjakkapp.Chess.in_checkmate()) {
                message = "Game over by check mate."
            } else if (Sjakkapp.Chess.in_threefold_repetition()) {
                message = "Game over by threefold repetition."
            } else if (Sjakkapp.Chess.in_stalemate()) {
                message = "Game over by stalemate."
            } else if (Sjakkapp.Chess.in_draw()) {
                message = "Game over by draw."
            } else if (Sjakkapp.Chess.insufficient_material()) {
                message ="Game over by insufficient material."
            }
            $("#board").css('opacity', 0.5)
            alert(title + " " + message)
        }
    }
     
}( window.Sjakkapp = window.Sjakkapp || {}, jQuery ));

$(document).ready(function() {

    Parse.initialize("0NkZxSv180JSfRrQLMi1IJQ5ZkJNcEWfXQWYUMRJ", "Pqhg31UmkErdu0AePchENZ7MpC0sAzMhEqSKYvCU");

    // Invoke the loading animation view while we're waiting for the rest to load.
    var View = new LoadingView()
    View.render()

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
                if (!$("script:empty[type='text/template']").length) { $(document).trigger('templatesLoaded') }
            }
        })
    })

})

// We'll need to declare the loading view here to make it immediately available to the DOM, so that the loading 
// animation can be properly displayed while the rest of the contents are being fetched. 

var LoadingView = Parse.View.extend({
    template: Handlebars.compile($("#loading-tpl").html()),
    render: function() { 
        this.$el.html(this.template())
        $("#content").html(this.el)
        return this
    }
})

// If the view changes, assume we're no longer in a game and stop monitoring move changes. This is okay
// because the view classes reponsible for loading up a game will restart move listeners as necessary.
$(document).on('templateChange', function() {
    Sjakkapp.unsubscribe()
})
$(document).on("templatesLoaded", function() {

    // Ok, at this point all our templates have been successfully fetched, so now we can set up the different
    // view classes and display some content. 

    var LoginView = Parse.View.extend({
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
                    var Header = new HeaderView({model: user})
                    View = new GamesView({model: user})
                },
                error: function(user, error) {
                    $("#content").find("input[name='email']").parent().addClass('has-error')
                    $("#helpBlock").html(error.message)
                }
            });
        },
        signup: function(e) {             
            View = new SignupView() 
            View.render()
        },
        render: function() { 
            $(document).trigger('templateChange')
            this.$el.html(this.template()); 
            $("#content").html(this.el); 
            return this 
        }
    })

    var SignupView = Parse.View.extend({
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

            Parse.User.signUp(username, password, { ACL: new Parse.ACL() }, {
                success: function(user) {
                    var Header = new HeaderView({model: Parse.User.current()})
                    var View = new GamesView({model: Parse.User.current()})
                },
                error: function(user, error) {
                    $("#helpBlock").html(error.code + " " + error.message)
                    $("#content").find("input[name='email']").parent().addClass('has-error')
                }
            });
        },
        signin: function(e) {
        	var View = new LoginView()
        	View.render()
        },
        render: function() {
            $(document).trigger('templateChange')
            this.$el.html(this.template())
            $("#content").html(this.el)
            return this 
        }
    })

    // The gamesview will automatically self-render on intialization.
    var GamesView = Parse.View.extend({
    	template: Handlebars.compile($('#games-tpl').html()),
        events: {
            "click a.game": "game"
        },
        game: function(e) {
            e.preventDefault()
            var View = new LoadingView()
            View.render()            
            var Game = Parse.Object.extend("Game")
            var objectId = $(e.target).parent().parent().data('id')
            var query = new Parse.Query(Game)

            query.include('White', 'Black')

            query.get(objectId, {
                success: function(game) {
                    var User = Parse.Object.extend("User")
                    var b = new User(), w = new User()
                    var opponent = new User()
                    var color = "w"

                    b = game.get('Black')
                    w = game.get('White')
                    // are we black or white?
                    opponent = b
                    
                    if (w.get('username') != Parse.User.current().get('username')) {
                        opponent = w
                        color = "b"
                    }

                    Sjakkapp.Game = game
                    Sjakkapp.Players.Black = b
                    Sjakkapp.Players.White = w
                    Sjakkapp.currentColor = color

                    var View = new GameView({game: game})
                    View.render()
                },
                error: function(game, error) {
                    console.log("Error:" + error.id + " " + error.message)
                }
            })
        },
    	initialize: function() {

            // We want to generate a list of games to the user along with some vital information
            // for each game.

    		if (typeof this.collection === 'undefined') {

    			var Game = Parse.Object.extend("Game")

                var qWhite = new Parse.Query(Game)
                var qBlack = new Parse.Query(Game)

                qWhite.equalTo('White', Parse.User.current())
                qBlack.equalTo('Black', Parse.User.current())
                
                query = new Parse.Query.or(qWhite, qBlack)
                query.include("White", "Black")
                query.descending("updatedAt")

                var Games = Parse.Collection.extend({
                    model: Game,
                    query: query
                })

                var games = new Games()

                games.fetch({
    				success:function(games) {
    					var View = new GamesView({ collection: games, model: Parse.User.current() })
    					View.render()
    				},
    				error:function(games, error) {
    					console.log(error.message)
    				}
    			})
                
                /*
                games.fetch().then(function(results) { 
                    console.log(results.length) 
                    return Parse.Cloud.run('getGameTime', { Game: Sjakkapp.Game.id, createdAt: Sjakkapp.Game.createdAt })
                }).then(function(results) {
                    console.log(results)
                })
                */
    		}
    	},
    	render: function() {
            $(document).trigger('templateChange')            
            var game = this.collection.toJSON()
            
            for (i =0, l = game.length; i < l; i++) {
                b = this.collection.models[i].attributes.Black
                w = this.collection.models[i].attributes.White
                c = "White"
                c2 = 'w'
                o = b

                if (Parse.User.current().get('username') != w.get('username')) {
                    c = "Black"
                    c2 = 'b'
                    o = w
                }

                if (this.collection.models[i].get('Turn') == c2) {
                    game[i].isItMyTurn = true
                    s = "Your turn"
                } else {
                    game[i].isItMyTurn = false
                    s = "Opponent's turn"
                }

                if (this.collection.models[i].get('Gameover')) {
                    s = "Game over"
                    game[i].isItMyTurn = false
                }
                //game[i].Black.username = b.get('username')
                //game[i].White.username = w.get('username')
                game[i].Black = b.toJSON()
                game[i].White = w.toJSON()
                game[i].Opponent = o.toJSON()
                game[i].Color = c
                game[i].State = s

            }

            var context = { game: game, user: this.model.toJSON()}
            this.$el.html(this.template(context))
            $("#content").html(this.el)
    	}
    })

    var ContactsView = Parse.View.extend({
        template: Handlebars.compile($('#contacts-tpl').html()),
        events: {
            "click #cmdPlayOpponent": "playOpponent"
        },
        playOpponent: function(e) {
            var View = new LoadingView()
            View.render() 
            var id = $(e.target).parent().parent().data('id')
            var Opponent = Parse.Object.extend("User");
            var query = new Parse.Query(Opponent);
            
            query.get(id, {
                success: function(Opponent) {
                    var Game = new Parse.Object("Game")

                    if (Math.round(Math.random())) {
                        Game.set('White', Parse.User.current())
                        Game.set('Black', Opponent)
                        Sjakkapp.currentColor = 'w'
                    } else {
                        Game.set('White', Opponent)
                        Game.set('Black', Parse.User.current())
                        Sjakkapp.currentColor = 'b'
                    }
                    
                    Sjakkapp.Players.White = Game.get('White')
                    Sjakkapp.Players.Black = Game.get('Black')

                    Game.set('createdBy', Parse.User.current())
                    Game.set('Turn', 'w')
                    Game.set('State', "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")

                    Game.save(null, {
                        success: function(game) {
                            Sjakkapp.Game = Game
                            var View = new GameView({ game: Game })
                            View.render()
                        }
                    })
                },
                error: function(object, error) {
                    console.log("error: " + error.message)
                }
            });
        },
        initialize: function() {
            if (typeof this.collection !== 'undefined') { return }
            var query = new Parse.Query("User")

            query.notEqualTo("username", Parse.User.current().get("username"))

            query.find({
                success: function(players) {
                    var View = new ContactsView({model: Parse.User.current(), collection: players})
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

    var SettingsView = Parse.View.extend({
        template: Handlebars.compile($('#settings-tpl').html()),
        render: function() { 
            $(document).trigger('templateChange')            
            this.$el.html(this.template({user: this.model.toJSON()})); 
            $("#content").html(this.el);
            return this
        }
    })    

    var GameView = Parse.View.extend({
        template: Handlebars.compile($('#game-tpl').html()),
        events: {
            "click button#cmdChat": 'chat'
        },
        chat: function(e) {
            $(".chat").toggle()
        },
        render: function() {
            $(document).trigger('templateChange')
            var b = Sjakkapp.Players.Black
            var w = Sjakkapp.Players.White
            var c = 'w'
            var o = b
            var orientation = 'white'

            if (Parse.User.current().get('username') != w.get('username')) {
                o = w
                c = 'b'
                orientation = "black"
            }

            var context = {user: Parse.User.current().toJSON(), opponent: o.toJSON(), game: this.options.game.toJSON() }
            this.$el.html(this.template(context))
            $("#content").html(this.el);

            Sjakkapp.Chess = new Chess(Sjakkapp.Game.get('State'))
            Sjakkapp.Board = new ChessBoard('board', {
               draggable: true,
               position: Sjakkapp.Game.get('State'),
               orientation: orientation,
               onDragStart: function(source, piece, position, orientation) {
                  var t = Sjakkapp.Chess.turn()
                  return (Sjakkapp.currentColor == t && t == piece[0])
               },
               onDrop: function(source, target, piece, newpos, oldpos, orientation) {
                    if ((move = Sjakkapp.Chess.move({
                        from: source,
                        to: target,
                        promotion: 'q'
                    })) === null) return 'snapback'

                    Sjakkapp.Game.set('State', Sjakkapp.Chess.fen())
                    Sjakkapp.Game.set('Turn', Sjakkapp.Chess.turn())
                    Sjakkapp.Game.increment('Moves')
                    Sjakkapp.Game.save()

                    // Also add the move to the movehistory
                    var MoveHistory = Parse.Object.extend("MoveHistory")
                    var moves = new MoveHistory()
                    moves.save({
                        'Game': Sjakkapp.Game,
                        'Color': Sjakkapp.currentColor,
                        'From': source,
                        'To': target,
                        'Piece': piece
                    })
                    moves.save()
                }
            });

            Parse.Cloud.run('getGameTime', { Game: Sjakkapp.Game.id, createdAt: Sjakkapp.Game.createdAt}).then(function(timeElapsed) {
                
                Sjakkapp.timeElapsed.White = timeElapsed.White
                Sjakkapp.timeElapsed.Black = timeElapsed.Black                

                // lastMove contains the timestamp for when the last move was made. So whatever difference there is between that timestamp
                // and now, we have to add that to whichever player's turn it is right now.
                var timestamp = Math.round(new Date().getTime() / 1000)
                var difference = timestamp - timeElapsed.lastMove

                if (Sjakkapp.Chess.turn() == "w") {
                    Sjakkapp.timeElapsed.White += difference
                } else {
                    Sjakkapp.timeElapsed.Black += difference
                }                
                })

            Sjakkapp.subscribe() 
            return this
        }
    })    

    var HeaderView = Parse.View.extend({
        template: Handlebars.compile($("#header-tpl").html()),
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
            var dest = $(e.target).attr('id').substr(3)
            switch(dest) {
                case "Games": 
                    var View = new GamesView({ model: Parse.User.current() })
                    break
                case "Contacts":
                    var View = new ContactsView({ model: Parse.User.current() })
                    View.render()
                    break;
                case "Settings":
                    var View = new SettingsView({ model: Parse.User.current() })
                    View.render()
                    break;
                case "Profile":
                    var View = new ProfileView({ model: Parse.User.current() })
                    View.render()
                    break;
            }
            $(e.target).parent().siblings().removeClass('active')
            $(e.target).parent().addClass('active')
        },        
        logout: function(e) {
            e.preventDefault()
            Parse.User.logOut()
            $("#header").empty()
            var View = new LoginView({ model: Parse.User.current() })
            View.render()
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

    var ProfileView = Parse.View.extend({
        template: Handlebars.compile($("#profile-tpl").html()),
        render: function() {
            $(document).trigger('templateChange')            
            this.$el.html(this.template({user: this.model.toJSON()}))
            $("#content").html(this.el)
            return this
        }
    })

    // end Views section.

    if (Parse.User.current()) {
        var Header = new HeaderView({model: Parse.User.current()})
        var View = new GamesView({model: Parse.User.current()})
        Parse.User.current().set('lastLogin', new Date())
    } else {
        var View = new LoginView()
        View.render()
    }


})
