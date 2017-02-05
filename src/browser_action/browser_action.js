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

    $.ajax({
        url: requestUrl,
        type: 'GET',
        dataType: 'html',
        success: function(userPage) {
            var tmpEl = $('<div>');
            tmpEl.html(userPage);

            var karmaElement = tmpEl.find('#content > div.profile-page > div.profile-page__user > div.karma > span');
            var ratingElement = tmpEl.find('#content > div.profile-page > div.profile-page__user > div.rating > span');
            var karma = karmaElement.text();

            tKarma.text(karma);
            if (karma[0] === '–') {
                tKarma.addClass('account-karma-low');
            }

            tRating.text(ratingElement.text());
        },
        error: function() {
            alert('Невозможно сохранить данного пользователя');
        }
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