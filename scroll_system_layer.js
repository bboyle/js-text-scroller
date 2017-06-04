/*
	*	File:		scroll_system_layer.js
	*	Name:		Scrolling system control
	*	Date:		2001-04-17

	*	Author:		Ben Boyle
	*	Email:		bboyle@inspire.server101.com

	*	Platform:	document.layers (Netscape 4+)

	Scroll handling

*/


// write html scroller
function scroll_write_html(scroller) {
	var mouseOver = (scroller.pause_mo ? ' onMouseOver="scroll_mo_freeze(\'' + scroller.id + '\');"; onMouseOut="scroll_mo_freeze(\'' + scroller.id + '\', false);"' : '');
	document.writeln('<ilayer id="' + scroller.id + '" width="' + scroller.width + '" height="' + scroller.height + '" visibility="show">');
	document.writeln(scroll_pf_layer_css(scroller.id+'y', scroller.classStop, '', 'show', '&nbsp;', scroller.width, scroller.height));
	document.writeln(scroll_pf_layer_css(scroller.id+'x', scroller.classPlay, mouseOver, 'hide', '&nbsp;', scroller.width, scroller.height));
	// loop through list
	var i = scroller.first;
	do {
		var layer = scroll_item_html(i);
		document.writeln(scroll_pf_layer_css(i.id, i.classPlay, mouseOver, 'hide', layer, scroller.width));
		document.writeln(scroll_pf_layer_css(i.id+'x', i.classStop, mouseOver, 'hide', layer, scroller.width));
		// next
		i = i.next;
	} while (i != scroller.first);

	document.writeln('</ilayer>');
}


// write layer with CSS support
function scroll_pf_layer_css(id, css, mo, visible, html, width, height) {
	return '<layer id="' + id + '"' + mo + ' visibility="' + visible + '" width="' + width + '"' + (height ? ' height="' + height + '"' : '') + scroll_css_html(css) + '>' + html + '</layer>';
}


// do the scrolling
function scroll_pf_play(scroller) {
	if (!scroller.active) {
		scroll_pf_layers(scroller);
	}
	// show active layer
	scroller.active.visibility = 'show';
	scroller.layer.visibility = 'hide';
	// scroll
	scroll_do(scroller.id);
}


// stop scrolling
function scroll_pf_stop(scroller) {
	// hide active layer
	scroller.layer.visibility = 'show';
	scroller.active.visibility = 'hide';
}


// perform scrolling
function scroll_do(id) {
	scroller = scroll_find(id);

	// calculate scroll increment
	var yinc = (scroller.shuttle * scroller.px);
	// will we scroll past the item?
	if (yinc > 0) {
		if (scroller.hilight.top > 0 && scroller.hilight.top - yinc < 0) {
			yinc = scroller.hilight.top;
		}
	} else {
		if (scroller.hilight.top < 0 && scroller.hilight.top - yinc > 0) {
			yinc = scroller.hilight.top;
		}
	}

	// calculate positions and clipping
	scroll_pf_calculate(scroller, yinc);
	// move and clip all items
	scroll_pf_position(scroller, yinc > 0);

	// pause?
	var timeout;
	if (scroller.hilight.top == 0) {
		timeout = scroller.pause;
		// hilight item
		scroller.hilight.paused = true;
		scroller.hilight.active.visibility = 'show';
		scroller.hilight.layer.visibility = 'hide';
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
		if (i.top + i.height <= 0) {
			scroll_hide(i);
			if (yinc > 0) {
				// going up, wrap to bottom
				scroll_wrap_to_bottom(scroller, i);
				if (i == scroller.first) {
					scroller.first = i.next;
				}
			}
		} else if (i.top >= scroller.height) {
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
			i.clip_top = (i.top < 0 ? 0 - i.top : 0);
			i.clip_bottom = (i.top + i.height > scroller.height ? scroller.height - i.top : i.height);
			i.onscreen = true;
		}
		if (i.paused) {
			i.layer.visibility = 'show';
			i.active.visibility = 'hide';
			i.paused = false;
		}
		i = (yinc > 0 ? i.next : i.prev);
	} while (i != start);
}


// position and clip elements
function scroll_pf_position(scroller, up) {
	var i = scroller.first;
	while (i.onscreen) {
		i.layer.top = i.top;
		i.layer.clip.top = i.clip_top;
		i.layer.clip.bottom = i.clip_bottom;
		if (!i.visible) {
			i.visible = true;
			i.layer.visibility = 'show';
		}
		i.onscreen = false;
		i = (up ? i.next : i.prev);
	}
}


// direction of scroller
function scroll_pf_direction(scroller) {
	if (!scroller.active) {
		scroll_pf_layers(scroller);
	}
	// find top
	var i = scroller.first;
	while (i.prev.top < i.top) {
		i = i.prev;
	}
	
	// find hilight element
	if (scroller.shuttle > 0) {
		// wrap top items
		while (i.top + i.height <= 0) {
			scroll_hide(i);
			scroll_wrap_to_bottom(scroller, i);
			i = i.next;
		}
		scroller.first = i;
		scroller.hilight = (i.top <= 0 ? i.next : i);

	} else if (scroller.shuttle < 0) {
		do {
			i = i.prev;
		} while (i.top >= scroller.height);
		scroller.first = i;
		// wrap bottom items
		i = i.prev;
		while (i != scroller.first) {
			if (i.top > scroller.height) {
				scroll_hide(i);
				scroll_wrap_to_top(scroller, i);
			}
			i = i.prev;
		}
		// find hilight
		i = scroller.first.next;
		while (i.next.top < 0) {
			i = i.next;
		}
		scroller.hilight = i;
	}
}


// wrap to bottom
function scroll_wrap_to_bottom(scroller, i) {
	i.top = i.prev.top + i.prev.height;
	if (i.top < scroller.height) {
		i.top = scroller.height;
	}
}


// wrap to top
function scroll_wrap_to_top(scroller, i) {
	i.top = (i.next.top > 0 ? 0 : i.next.top) - i.height;
}


// hide an item
function scroll_hide(i) {
	if (i.visible) {
		i.layer.visibility = 'hide';
		i.layer.visibility = 'hide';
		i.visible = false;
	}
}


// calculate layer details
function scroll_pf_layers(scroller) {
	var sclayer = document[scroller.id];
	// active layer
	scroller.active = sclayer.layers[scroller.id+'x'];
	scroller.layer = sclayer.layers[scroller.id+'y'];

	// get all item elements
	var i = scroller.first;
	var y = scroller.height;
	while (!i.top) {
		i.top = y;
		i.layer = sclayer.layers[i.id];
		i.height = i.layer.document.height;
		// position and clip active item
		i.active = sclayer.layers[i.id+'x'];
		i.active.top = 0;
		if (i.active.document.height > scroller.height) {
			i.active.clip.bottom = scroller.height;
		}
		// next item (start pos)
		y += i.height;
		i = i.next;
	}
	scroller.hilight = scroller.first;
}
