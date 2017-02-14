function loadKarmaAndRating(user, row) {
    var tKarma = $(row).find('.account-karma');
    var tRating = $(row).find('.account-rating');

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
            alert('Невозможно сохранить данного пользователя');
            return;
        }

        var karma = dom.querySelector('.karma > span').textContent;
        var rating = dom.querySelector('.rating > span').textContent;

        tKarma.text(karma);
        if (karma[0] === '–') {
            tKarma.addClass('account-karma-low');
        }

        tRating.text(rating);
    });
}

function restoreUsers(users) {
    var tmpl = document.querySelector('#account-row');
    var tAccountAvatar = tmpl.content.querySelector('.account-avatar');
    var tAccountName = tmpl.content.querySelector('.account-name');
    var tAccountResource = tmpl.content.querySelector('.account-resource');

    var tbody = document.querySelector('#accounts');
    $(tbody).empty();

    users.forEach(function(user) {
        tAccountAvatar.setAttribute('src', user.avatar);
        tAccountName.textContent = user.name;
        tAccountResource.setAttribute('src', '/img/' + user.resource + '.jpg');

        var tr = document.importNode(tmpl.content, true);
        loadKarmaAndRating(user, tr);

        tbody.appendChild(tr);
    });
}

function loadUsers() {
    chrome.storage.local.get({
        users: []
    }, function(items) {
        restoreUsers(items.users);
    });
}

loadUsers();
$('#btn-settings').on('click', function() {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL('/src/options/index.html'));
    }
});