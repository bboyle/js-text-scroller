/*
	*	File:		scroll_system.js
	*	Name:		Scrolling system control
	*	Date:		2001-06-22

	*	Author:		Ben Boyle
	*	Email:		bboyle@inspire.server101.com

	*	Platform:	all javascript browsers
	*	Namespace:	all variables and functions prefixed with "scroll_"

	System functions (cross-platform) shared by scroll system.
	Dynamically loads correct platform library (IE, Netscape, default) to handle scroller.
	All configuration handled through scroll_config.js and CSS classes.

*/


// LOADER - loads browser specific version
if (document.getElementById) {
	// standard - Netscape6, IE 4/5
	document.writeln('<script language="Javascript" type="text\/javascript" src="scroll_system_id.js"><\/script>');
} else if (document.layers) {
	// layers - Netscape 4, 3
	document.writeln('<script language="Javascript" type="text\/javascript" src="scroll_system_layer.js"><\/script>');
} else {
	// default - displays titles only
	document.writeln('<script language="Javascript" type="text\/javascript" src="scroll_system_default.js"><\/script>');
}


/*
scroll_config.js variables
- The following variables can all be user-defined in scroll_config.js
*/

// css classes
var scroll_css_control_play = '';
var scroll_css_control_stop = '';
var scroll_css_item_play = '';
var scroll_css_item_stop = '';
var scroll_css_item_title = '';
var scroll_css_item_description = '';
var scroll_css_item_links = '';
// what to link
var scroll_link_title = true;
var scroll_link_description = false;

// scroll width and height (clipping size)
var scroll_width = 100;
var scroll_height = 100;
// scroll pause - time (seconds) an item pauses when it reaches the top
var scroll_pause = 2;
// scroll fps (frames per second) - frame rate of scrolling animation
var scroll_fps = 12;
// number of pixels to scroll each frame
var scroll_pixels = 2;
// speed (shuttle) of scrolling (negative = reverse)
var scroll_shuttle = 1;

// behaviours
var onMouseOver_pause = false;

/*
 end scroll_config.js variables
*/


// scrollers
var scroll_control = new Array();
var scroll_css_cache = new Array();


// new scroller control object
function scroll_new_control(id) {
	this.id			= id.toString();
	this.width		= scroll_width;
	this.height		= scroll_height;
	this.pause		= Math.round(scroll_pause * 1000);
	this.pause_mo	= onMouseOver_pause;
	this.timeout	= Math.round(1000 / scroll_fps);
	this.px			= scroll_pixels;
	this.shuttle	= scroll_shuttle;
	this.play		= false;
	this.timer		= null;
	this.classPlay	= scroll_css_control_play;
	this.classStop	= scroll_css_control_stop;
}


// new scroller item object
function scroll_new_item(id, title, description, url, target) {
	this.id				= id.toString();
	this.title			= title;
	this.description	= description;
	this.url			= (url ? url : '');
	this.target			= target;
	this.classPlay		= (scroll_css_item_play ? scroll_find_class(scroll_css_item_play) : null);
	this.classStop		= (scroll_css_item_stop ? scroll_find_class(scroll_css_item_stop) : null);
	this.classTitle		= (scroll_css_item_title ? scroll_find_class(scroll_css_item_title) : null);
	this.classDesc		= (scroll_css_item_description ? scroll_find_class(scroll_css_item_description) : null);
	this.classLink		= (scroll_css_item_links ? scroll_find_class(scroll_css_item_links) : null);
	this.link_title		= scroll_link_title;
	this.link_desc		= scroll_link_description;
}


// scroll speed - set the speed
function scroll_speed(id, speed, increment) {
	scroll_speed_sc(scroll_find(id), speed, increment);
}


// scroll speed shuttle - increment play speed (negative to slow)
function scroll_speed_shuttle(id, shuttle) {
	scroll_speed_sc(scroll_find(id), shuttle, true);
}


// toggle play/pause
function scroll_play_stop(id) {
	var scroller = scroll_find(id);
	scroll_speed_sc(scroller, 1);
	if (scroller.play) {
		scroll_stop_sc(scroller);
	} else {
		scroll_play_sc(scroller);
	}
}


// play - scroll up
function scroll_play(id) {
	scroll_play_sc(scroll_find(id));
}
function scroll_play_sc(scroller) {
	if (!scroller.play) {
		scroller.play = true;
		scroll_restore_sc(scroller);
	}
}


// stop scrolling (pause)
function scroll_stop(id) {
	scroll_stop_sc(scroll_find(id));
}
function scroll_stop_sc(scroller) {
	if (scroller.play) {
		scroller.play = false;
		scroll_freeze_sc(scroller);
		scroll_pf_stop(scroller);
	}
}


// freeze play/pause toggle
function scroll_freeze(id, pause) {
	if (pause != false) {
		scroll_freeze_sc(scroll_find(id));
	} else {
		scroll_restore_sc(scroll_find(id));
	}
}


// mouse over toggle
function scroll_mo_freeze(id, pause) {
	var scroller = scroll_find(id);
	if (pause != false) {
		if (scroller.freeze) {
			clearTimeout(scroller.freeze);
			scroller.freeze = null;
		}
		scroll_freeze_sc(scroller);
	} else {
		if (!scroller.freeze) {
			scroller.freeze = setTimeout('scroll_freeze(\'' + id + '\', false);', 1);
		}
	}
}


// freeze a scroller (pause without changing play state)
function scroll_freeze_sc(scroller) {
	clearTimeout(scroller.timer);
	scroller.timer = null;
}


// restarts a scroller that may have been frozen
function scroll_restore_sc(scroller) {
	if (scroller.play && !scroller.timer) {
		scroll_pf_play(scroller);
	}
}


// scroll speed - set play speed, negative speed reverses
function scroll_speed_sc(scroller, speed, increment) {
	var shuttle = scroller.shuttle;
	scroller.shuttle = (increment ? scroller.shuttle : 0) + speed;
	// possible direction change
	if (scroller.shuttle && shuttle * scroller.shuttle <= 0) {
		scroll_pf_direction(scroller);
	}
	// if scroller playing
	if (scroller.play) {
		if (scroller.shuttle) {
			// speed (possibly again), restore play status
			scroll_restore_sc(scroller);
		} else {
			// no speed, freeze
			scroll_freeze_sc(scroller);
		}
	}
}


// add an item
function scroll_add(title, description, url, target) {
	var scroller = scroll_control[scroll_control.length - 1];
	if (scroller.first) {
		var i = 1;
		// add item to linked list
		var item = scroller.first;
		while (item.next) {
			item = item.next;
			i++;
		}
		item.next = new scroll_new_item(scroller.id + '-' + i, title, description, url, target);
		// double-link (previous item)
		item.next.prev = item;
	} else {
		// first item
		scroller.first = new scroll_new_item(scroller.id + '-0', title, description, url, target);
	}
}


// write html for item
function scroll_item_html(i) {
	var html = '';
	if (i.title) {
		html += '<strong' + scroll_css_html(i.classTitle) + '>' + (i.link_title && i.url ? scroll_item_link_html(i, i.title) : i.title) + '<\/strong><br \/>';
	}
	if (i.description) {
		html += '<small' + scroll_css_html(i.classDesc) + '>' + (i.link_desc && i.url ? scroll_item_link_html(i, i.description) : i.description) + '<br \/><\/small><br \/>';
	}

	// clear node (free memory)
	scroll_clear_node(i);

	return html;
}


// write link for item
function scroll_item_link_html(i, text) {
	return '<a href="' + i.url + (i.target ? '" target="' + i.target : '') + '"' + scroll_css_html(i.classLink) + '>' + text + '<\/a>';
}


// class html
function scroll_css_html(css) {
	return (css ? ' class="' + scroll_css_cache[css] + '"' : '');
}

// clear node (extra variables)
function scroll_clear_node(i) {
	i.title			= null;
	i.description	= null;
	i.url			= null;
	i.target		= null;
	i.classTitle	= null;
	i.classDesc		= null;
	i.classLink		= null;
	i.link_title	= null;
	i.link_desc		= null;
}


// find a scroller
function scroll_find(id) {
	var i = 0;
	while (i < scroll_control.length) {
		if (scroll_control[i].id == id) {
			return scroll_control[i];
		}
		i++;
	}
	// no such scroller, return 1st scroller
	return scroll_control[0];
}


// find class - caches classes
function scroll_find_class(name) {
	var i = 0;
	while (i < scroll_css_cache.length) {
		if (scroll_css_cache[i] == name) {
			return i;
		}
		i++;
	}
	// cache new class name
	scroll_css_cache[i] = name;
	return i;
}


// add a new scroll control
function scroll_create(id) {
	scroll_control[scroll_control.length] = new scroll_new_control(id);
}


// end of scrolling list, create scroller
function scroll_done() {
	var scroller = scroll_control[scroll_control.length - 1];
	// finish double linked list
	var i = scroller.first;
	while (i.next) {
		i = i.next;
	}
	// tail to head
	i.next = scroller.first;
	// head to tail
	scroller.first.prev = i;
	// write html
	scroll_write_html(scroller);
}
