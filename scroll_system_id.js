/*
	*	File:		scroll_system_id.js
	*	Name:		Scrolling system control
	*	Date:		2001-04-16

	*	Author:		Ben Boyle
	*	Email:		bboyle@inspire.server101.com

	*	Platform:	document.getElementById (Netscape 6, IE4+)

	Scroll handling

*/


// write html scroller
function scroll_write_html(scroller) {
	document.writeln('<div id="' + scroller.id + '"' + scroll_css_html(scroller.classStop) + ' style="width: ' + scroller.width + 'px; height: ' + scroller.height + 'px;"' + (scroller.pause_mo ? ' onMouseOver="scroll_mo_freeze(\'' + scroller.id + '\');"; onMouseOut="scroll_mo_freeze(\'' + scroller.id + '\', false);"' : '') + '>');
	
	// loop through list
	var i = scroller.first;
	do {
		// write the item
		document.writeln('<div id="' + i.id + '"' + scroll_css_html(i.classPlay) + ' style="position: absolute; width: ' + scroller.width + 'px; visibility: hidden;">\n' + scroll_item_html(i) + '<\/div>');
		// next
		i = i.next;
	} while (i != scroller.first);
	document.writeln('<\/div>');
}


// do the scrolling
function scroll_pf_play(scroller) {
	if (!scroller.element) {
		scroll_pf_elements(scroller);
	}
	// set class
	if (scroller.classPlay) {
		scroller.element.className = scroller.classPlay;
	}
	// scroll
	scroll_do(scroller.id);
}


// stop scrolling
function scroll_pf_stop(scroller) {
	// set class
	if (scroller.classStop) {
		scroller.element.className = scroller.classStop;
	}
}


// perform scrolling
function scroll_do(id) {
	scroller = scroll_find(id);

	// calculate scroll increment
	var yinc = (scroller.shuttle * scroller.px);
	// will we scroll past the item?
	if (yinc > 0) {
		if (scroller.hilight.top > scroller.top && scroller.hilight.top - yinc < scroller.top) {
			yinc = scroller.hilight.top - scroller.top;
		}
	} else {
		if (scroller.hilight.top < scroller.top && scroller.hilight.top - yinc > scroller.top) {
			yinc = scroller.hilight.top - scroller.top;
		}
	}

	// calculate positions and clipping
	scroll_pf_calculate(scroller, yinc);
	// move and clip all items
	scroll_pf_position(scroller, yinc > 0);

	// pause?
	var timeout;
	if (scroller.hilight.top == scroller.top) {
		timeout = scroller.pause;
		// hilight item
		scroller.hilight.paused = true;
		scroller.hilight.element.className = scroller.hilight.classStop;
		// next item for hilight
		scroller.hilight = (yinc > 0 ? scroller.hilight.next : scroller.hilight.prev);
	} else {
		timeout = scroller.timeout;
	}

	// timeout until next scroll
	scroller.timer = setTimeout('scroll_do(\'' + scroller.id + '\')', timeout);
}


// calculate positions of items
function scroll_pf_calculate(scroller, yinc) {
	var i = scroller.first;
	var start = i;
	
	do {
		i.top -= yinc;
		if (i.top + i.height <= scroller.top) {
			scroll_hide(i);
			if (yinc > 0) {
				// going up, wrap to bottom
				scroll_wrap_to_bottom(scroller, i);
				if (i == scroller.first) {
					scroller.first = i.next;
				}
			}
		} else if (i.top >= scroller.bottom) {
			scroll_hide(i);
			if (yinc < 0) {
				// going down, wrap to top
				scroll_wrap_to_top(scroller, i);
				if (i == scroller.first) {
					scroller.first = i.prev;
				}
			}

		} else {
			// calculate clipping
			i.clip_top = (i.top < scroller.top ? scroller.top - i.top : 0);
			i.clip_bottom = (i.top + i.height > scroller.bottom ? scroller.bottom - i.top : i.height);
			i.onscreen = true;
		}
		if (i.paused) {
			i.element.className = i.classPlay;
			i.paused = false;
		}
		i = (yinc > 0 ? i.next : i.prev);
	} while (i != start);
}


// position and clip elements
function scroll_pf_position(scroller, up) {
	var i = scroller.first;
	while (i.onscreen) {
		i.element.style.top = i.top + 'px';
		i.element.style.clip = 'rect(' + i.clip_top + 'px ' + scroller.width + 'px '+ i.clip_bottom + 'px 0px)';
		if (!i.visible) {
			i.visible = true;
			i.element.style.visibility = 'visible';
		}
		i.onscreen = false;
		i = (up ? i.next : i.prev);
	}
}


// direction of scroller
function scroll_pf_direction(scroller) {
	if (!scroller.element) {
		scroll_pf_elements(scroller);
	}
	// find top
	var i = scroller.first;
	while (i.prev.top < i.top) {
		i = i.prev;
	}
	
	// find hilight element
	if (scroller.shuttle > 0) {
		// wrap top items
		while (i.top + i.height <= scroller.top) {
			scroll_hide(i);
			scroll_wrap_to_bottom(scroller, i);
			i = i.next;
		}
		scroller.first = i;
		scroller.hilight = (i.top <= scroller.top ? i.next : i);

	} else if (scroller.shuttle < 0) {
		do {
			i = i.prev;
		} while (i.top >= scroller.bottom);
		scroller.first = i;
		// wrap bottom items
		i = i.prev;
		while (i != scroller.first) {
			if (i.top > scroller.bottom) {
				scroll_hide(i);
				scroll_wrap_to_top(scroller, i);
			}
			i = i.prev;
		}
		// find hilight
		i = scroller.first.next;
		while (i.next.top < scroller.top) {
			i = i.next;
		}
		scroller.hilight = i;
	}
}


// wrap to bottom
function scroll_wrap_to_bottom(scroller, i) {
	i.top = i.prev.top + i.prev.height;
	if (i.top < scroller.bottom) {
		i.top = scroller.bottom;
	}
}


// wrap to top
function scroll_wrap_to_top(scroller, i) {
	i.top = (i.next.top > scroller.top ? scroller.top : i.next.top) - i.height;
}


// hide an item
function scroll_hide(i) {
	if (i.visible) {
		i.element.style.visibility = 'hidden';
		i.visible = false;
	}
}


// calculate element details
function scroll_pf_elements(scroller) {
	// get element
	scroller.element = document.getElementById(scroller.id);
	scroller.top = 0;
	// add up offsetTop of all parent elements (sometimes thrown out by borders on tables)
	var e = scroller.element;
	while (e) {
		scroller.top += e.offsetTop;
		e = e.offsetParent;
	}
	// bottom of scroller
	scroller.bottom = scroller.top + scroller.height;

	// get all item elements
	var i = scroller.first;
	var y = scroller.bottom;
	while (!i.element) {
		i.element = document.getElementById(i.id);
		i.top = y;
		i.height = i.element.offsetHeight;
		// next item (start pos)
		y += i.height;
		i = i.next;
	}
	scroller.hilight = scroller.first;
}
