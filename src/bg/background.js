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
        if (err) {
            chrome.browserAction.setBadgeText({ text: '' });
            return;
        }

        var tmpEl = $(dom);

        var karmaElement = tmpEl.find('#content > div.profile-page > div.profile-page__user > div.karma > span');
        var karma = karmaElement.text();
        karma = karma.replace(/\u2013|\u2014/g, '-');

        if (karma[0] === '-') {
            chrome.browserAction.setBadgeBackgroundColor({ color: '#d53c30' });
        } else {
            chrome.browserAction.setBadgeBackgroundColor({ color: '#6c9007' });
        }

        if (karma.length > 4) {
            karma = '' + parseInt(karma, 10);
            if (karma[0] !== '-') {
                karma = '\u2248' + karma;
            }
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