function getDom(pageUrl, cb) {
    var req = new XMLHttpRequest();
    req.open('GET', pageUrl, true);
    req.responseType = 'document';
    req.overrideMimeType('text/html');

    req.onreadystatechange = function() {
        if (req.readyState !== 4) {
            return;
        }
        if (req.status !== 200) {
            cb(req.status);
            return;
        }

        cb(null, req.responseXML);
    };

    req.send(null);
}