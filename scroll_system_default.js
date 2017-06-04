/*
	*	File:		scroll_system_id.js
	*	Name:		Scrolling system control
	*	Date:		2001-04-17

	*	Author:		Ben Boyle
	*	Email:		bboyle@inspire.server101.com

	*	Platform:	any javascript platform

	Scroll handling

*/


// write html scroller
function scroll_write_html(scroller) {
	document.writeln('<table' + scroll_css_html(scroller.classPlay) + '><tr><td width="' + scroller.width + '" height="' + scroller.height + '">');
	
	// loop through list
	var i = scroller.first;
	// unlink last item
	i.prev.next = null;
	while (i) {
		// write the item
		document.writeln('<div' + scroll_css_html(i.classStop) + '>\n' + scroll_item_html(i) + '<\/div>');
		// next
		i = i.next;
	}
	document.writeln('<\/td><\/tr><\/table>');
}


// do the scrolling
function scroll_pf_play(scroller) {}
// stop scrolling
function scroll_pf_stop(scroller) {}
// direction of scroller
function scroll_pf_direction(scroller) {}

