
function getQueryValue(field) {
	var fields=location.search.substring(1).split("&");
	for (var value of fields) {
		var pair=value.split("=");
		if (pair[0]==field) return pair[1];
	}
	return null;
}
