/*
	*	File:		scroll_config.js
	*	Name:		Scroller configuration
	*	Date:		2001-04-23

	*	Author:		Ben Boyle
	*	Email:		bboyle@inspire.server101.com

	*	Platform:	all javascript browsers

	Configuration file for scroller.
	Remove the // from comments and adjust properties to suit.

	Copy and paste this HTML where the menu should appear:
	<script language="javascript" type="text/javascript" src="scroll_config.js"></script>
	* multiple config scrollers can be used on a single page

	Ensure this HTML code appears (once only) in the <HEAD> of your page
	<script language="javascript" type="text/javascript" src="scroll_system.js"></script>

	Functions to control scroller from HTML:
		scroll_play(id)
			start playing
		scroll_stop(id)
			stop playing
		scroll_play_stop(id)
			start/stop toggle (pauses if playing, plays if stopped)
		scroll_freeze(id, pause)
			pauses (if pause is "true") or restores playback (if pause is "false")
			eg. scroll_freeze('scroller', true);
		scroll_speed(id, speed)
			set the scrolling speed (1 normal, 2 double speed, -1 reverse, ..)
		scroll_speed_shuttle(id, shuttle)
			adjust the speed by "shuttle" amount (1, speed up, -1 slow down, 2 big speed up)
*/


/*
	CSS display configuration classes (class names can be customised):
	examples:
		.scrollerplay { background-color: #CCCCCC; layer-background-color: #CCCCCC; color: #000000; }
		.scrollerstop { background-color: #BCBCBC; layer-background-color: #BCBCBC; color: #ECECEC; }
		.scrollitemplay { }
		.scrollitemstop { background-color: #ECECEC; }
		.scrollitemtitle { font-size: 90%; font-weight: bold; }
		.scrollitemdescription { font-size: 80%; }
		a.scrollitemlink:link, a.item:visited { text-decoration: none; }
		a.scrollitemlink:active, a.scrollitemlink:hover { text-decoration: underline; }
*/
//	scroller box, during playback
scroll_css_control_play = 'scrollerplay';
//	scroller box, when stopped
scroll_css_control_stop = 'scrollerstop';
// a scrolling item, during normal playback
scroll_css_item_play = 'scrollitemplay';
// a scrolling item, when paused at the top
scroll_css_item_stop = 'scrollitemstop';
// titles in scrolling items <STRONG>
scroll_css_item_title = 'scrollitemtitle';
// descriptions in scrolling items <SMALL>
scroll_css_item_description = 'scrollitemdescription';
// links in scrolling items <A HREF="..>
scroll_css_item_links = 'scrollitemlink';

/*
	what parts of each item should be linked?
	- title			(by default this is linked)
	- description	(by default, descriptions are NOT linked)
*/
//scroll_link_title = false;
//scroll_link_description = true;


/*
	width and height of scroller box (default is 100px x 100px)
*/
//scroll_width = 100;
//scroll_height = 100;


/*
	scrolling speed configuration
	- scroll_fps:		framerate (frames per second) of the animation
						* higher numbers are smoother, 12 fps is adequate for most motion
						* as a guide..
							* film (cinema) runs at 24fps
							* tv/video runs at 25 fps (PAL) or 30 fps (NTSC)
	- scroll_pixels:	number of pixels the scroller moves by each frame
						* larger amounts make for jerkier motion
						* the scroller adjusts as necessary to ensure items pause at the top
	- scroll_pause:		delay (in seconds) each item waits when it reaches the top
*/
//scroll_fps = 12; // frames per second
//scroll_pixels = 2; // pixels
//scroll_pause = 2; // seconds


/* 
	pause onMouseOver - if you want the scroller to freeze when the mouse is over, turn on.
*/
onMouseOver_pause = true;


/*
	create a scroller!
	* scroll_create(id)
		- create the scroller control and give it an ID
		- id must conform to CSS ID requirements: eg. scroller1
	* scroll_add(title, description, url, target)
		- add all the scrolling items
			- title [optional] of item, treat as html, escape < &lt; and > &gt;
			- description [optional] (as above)
			- URL [optional] address of webpage to link to
			- target [optional] target frame for URL link
	* scroll_done()
		- generates html code for the scroller

	if you want it to start scrolling automatically, add this to your HTML page:
	<BODY ... onLoad="scroll_play('scroller-id');">
	(replace scroller-id with the ID you use below)

*/
scroll_create('scroller1');

scroll_add('1. Welcome', 'Javascript scroller created by Ben Boyle', 'http://inspire.server101.com/ben/resume/');
scroll_add('2. It works', 'in Netscape 6, Internet Explorer 4+, Netscape 4+', 'http://inspire.server101.com/ben/resume/experience/programming/javascript.html');
scroll_add('3. Old browsers', 'without CSS-P cannot support scrolling, all items are displayed', 'http://inspire.server101.com/ben/resume/experience/programming/javascript.html');
scroll_add('4. Remember', 'use &lt;noscript&gt; to support browsers without javascript', 'http://inspire.server101.com/ben/resume/experience/programming/javascript.html');
scroll_add('5. Problems?', 'Let me know if you encounter any problems or difficulties', 'http://inspire.server101.com/ben/resume/contact/');
 
scroll_done();

