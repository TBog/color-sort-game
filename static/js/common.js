function $(id) { return document.getElementById(id); }

function isEmpty(mixedVar) {
	let undef;
	const emptyValues = [undef, null, false, 0, '', '0'];
	for (let i = 0, len = emptyValues.length; i < len; ++i) {
		if (mixedVar === emptyValues[i]) {
		  return true
		}
	}
	return false;
}

function humanFormatDeltaTime(deltaMills) {
	//return deltaMills.toFixed(2);
	let ms = Math.floor(deltaMills);
	let seconds = Math.floor(deltaMills / 1000);
	ms -= seconds * 1000;
	let minutes = Math.floor(seconds / 60);
	seconds -= minutes * 60;
	if (minutes > 0)
		return `${minutes}m ${seconds}s ${ms}ms`;
	if (seconds > 0)
		return `${seconds}s ${ms}ms`;
	return `${ms}ms (${deltaMills.toFixed(2)})`;
}

function escapeText(text) {
	if (typeof text != 'string') {
		text = text.toString();
	}
		
	return encodeURI(text);
}

function unescapeText(text) {
	return decodeURI(text);
}

function getOffset( el ) {
    var _x = 0;
    var _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return { top: _y, left: _x };
}
