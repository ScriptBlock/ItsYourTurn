# Roleplaying Initiative Tracker

Web-based and API driven initiative tracker for D&D and clock-style role playing games.

A few goals for this project:
* A server-based app for tracking ordered initiative lists in rounds and segments.
	* For D&D type games, an arbitrary number of segments can be used, with each turn complete advancing the players initiative to the next round in the same segment
	* For clock style games, a fixed number of segments will be used, with each turn advancing that players clock a variable number of segments
	* Exposes an API for third party tools to interactive with initiative
* The ability for a user to:
	* log on very easily and associate their login with a player or game master
	* indicate their starting initiative segment
	* indicate turn or segment complete (with number of segments to advance in a clock style game)
	* set round/segment reminders (spell completion, etc)
	* act as a game master
* The Game master must be able to:
	* adjust the clock
	* add/remove players (and NPCs) from initiative
	* set reminders both hidden and visible

## The intention of the API is to allow third party tools to work with the initiative system for things like
* Displaying the initiative on a large communial screen
* Use of an "initiative widget" to allow players that don't want to use computer/mobile device during gaming


