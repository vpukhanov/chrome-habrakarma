var currentTimeout = null;

function updateBadge(user) {
    chrome.browserAction.setBadgeBackgroundColor({ color: '#000000' });
    chrome.browserAction.setBadgeText({ text: '...' });

    var requestUrl = '';
    switch (user.resource) {
    case 'Habrahabr':
        requestUrl = 'https://m.habrahabr.ru/users/';
        break;
    case 'Geektimes':
        requestUrl = 'https://m.geektimes.ru/users/';
        break;
    }
    requestUrl += user.name;

    getDom(requestUrl, function(err, dom) {
        if (err || !(dom instanceof HTMLDocument)) {
            chrome.browserAction.setBadgeText({ text: '' });
            return;
        }

        var karma = dom.querySelector('.karma > span').textContent;
        karma = karma.replace(/\u2013|\u2014/g, '-');

        if (karma[0] === '-') {
            chrome.browserAction.setBadgeBackgroundColor({ color: '#d53c30' });
        } else {
            chrome.browserAction.setBadgeBackgroundColor({ color: '#6c9007' });
        }

        if (karma.length > 4) {
            karma = '' + parseInt(karma, 10);
        }

        chrome.browserAction.setBadgeText({ text: karma });
    });
}

function startUpdate() {
    chrome.storage.local.get({
        trackedUser: null,
        updateDelay: 10
    }, function(items) {
        if (items.trackedUser) {
            updateBadge(items.trackedUser);
        } else {
            chrome.browserAction.setBadgeText({ text: '' });
        }

        currentTimeout = setTimeout(startUpdate, items.updateDelay * 60 * 1000);
    });
}

startUpdate();

chrome.runtime.onMessage.addListener(function(request, sender) {
    if (request === 'changeTracked') {
        if (currentTimeout) {
            clearTimeout(currentTimeout);
        }
        startUpdate();
    }
});