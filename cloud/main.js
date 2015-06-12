
// We need some functionality from Jeff's chess library (such as checking whether 
// a given game is in a game over state) so let's import it into our cloud code.
var ChessModule = require("cloud/chess.min.js")
var Chess = ChessModule.Chess

Parse.Cloud.beforeSave("Game", function(request, response) {

	// If the Moves field is missing from a Game object that means this is a new entry in the DB,
	// so let's set some defaults to avoid other components encountering problems when retrieving
	// objects and not finding fields they expect to be there. 
	if (!request.object.get('Moves')) {
		request.object.set('Moves', 0)
		request.object.set('Gameover', false)
		request.object.set('createdBy', Parse.User.current())
		request.object.set('Turn', 'w')
		request.object.set('State', "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")

	} else {

		var fen = request.object.get("State")
		var chess = new Chess(fen)

		// When a piece is placed such that the game is over (regardless of how it ends), let's set the
		// game's Gameover field to true and calculate the total duration of the game (in seconds). We do
		// this so that the when a collection of game objects is retrieved, both of these pieces of 
		// information will be available and can be displayed without having to do extra fetching/calculations.
		if (chess.game_over()) {
			var createdAt = Math.round(request.object.createdAt.getTime() / 1000)
			var currentTime = Math.round(new Date().getTime() / 1000)
			var timeElapsed = currentTime - createdAt
			request.object.set('timeElapsed', timeElapsed)
			request.object.set("Gameover", true)
		}

	}

	response.success()

})

Parse.Cloud.beforeSave(Parse.User, function(request, response) {
	if (!request.object.get('nickname')) { request.object.set('nickname', request.object.get('username')) }
	response.success()
})

// getGameTime: This function calculates the time elapsed between each move made. It doesn't care whether
// the game is open or closed (i.e.: whether a player is actually watching at the chess board on his monitor),
// instead, it just figures out how much time elapsed between moves and sums it up for each player.
Parse.Cloud.define("getGameTime", function(request, response) {

	if (typeof request.params.createdAt === 'undefined' 
	|| !(request.params.createdAt instanceof Date)
	|| (typeof request.params.Game === 'undefined')) {
		response.error()
	}

	var lastMove = new Date(request.params.createdAt).getTime()
	var Game = new Parse.Object("Game")
	Game.id = request.params.Game;

	var MoveHistory = Parse.Object.extend("MoveHistory")
	var Query = new Parse.Query(MoveHistory)

	Query.equalTo("Game", Game)
	Query.ascending("createdAt")

	Query.find({
		success: function (results) {
			var moveCount = results.length
			var accTimeBlack = 0
			var accTimeWhite = 0

			for (var index = 0; index < moveCount; index++) {
				var thisMove = new Date(results[index].createdAt).getTime()
				var difference = thisMove - lastMove

				if ((index+1) % 2) {
					accTimeWhite = accTimeWhite + difference
				} else {
					accTimeBlack = accTimeBlack + difference
				}
				lastMove = thisMove
			}
			if (!moveCount) {
				lastMove = new Date(request.params.createdAt).getTime()
			}
			lastMove = Math.round(lastMove / 1000)
			accTimeBlack = Math.round(accTimeBlack / 1000)
			accTimeWhite = Math.round(accTimeWhite / 1000)
			var accTimeTotal = accTimeWhite + accTimeBlack
			response.success({'Total': accTimeTotal, 'White': accTimeWhite, 'Black': accTimeBlack, 'lastMove': lastMove})
		},
		error: function(error) {
			response.error(error)
		}
	})
})