CURRENT STATUS

1. Source code restructure

I've restructured and "modulized" the source code, so now the sjakkapp module has its own folder,
and each "sub module" (i.e.: function) resides in its own file. The various views are also divided
into separate files in the js/view folder. This should hopefully make the code more managable. 

2. Transition over to using pub nub.

For the initial prototype app, chess moves were propagated among clients by refetching the currently active
game object from Parse every 500 milliseconds. But we want to keep the number of Parse requests to a minimum,
and definitely do not wanna exceed 30 requests / second (because then Parse stops being free). So this
doesn't scale very well to large number of users. In this version, I've abandoned this approach. Instead,
we're using pub nub for communication between clients. Moves will still generate parse requests, but we're
not going to be hammering the server every half a second looking for updates. Pub nub can also be used for
chatting among clients.  

3. "Reinvented" the Sjakkapp module

In the first version, the Sjakkapp module could only "hold" one game at a time, and would only receive
updates for games that were currently open. Now the Sjakkapp module holds ALL active games in memory, and
concurrently monitors changes for all of them. This means we can get notifications even for games that are not
open in the game window.  

INSTALLATION

I've "modulized" the source code, so to get it running on parse, we need to merge all the files
in js/views and js/sjakkapp (merging order doesn't matter) into one large script, sjakkapp.js,
which must be put in the js/ folder.
