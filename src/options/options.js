var _options = {
    trackedUser: null,
    users: [],
    updateDelay: 10
};

function areUsersEqual(usrA, usrB) {
    return usrA.name.toLowerCase() === usrB.name.toLowerCase() && usrA.resource === usrB.resource;
}

function restoreUserAccounts(users) {
    var tmpl = document.querySelector('#account-row');
    var tAccountAvatar = tmpl.content.querySelector('.account-avatar');
    var tAccountName = tmpl.content.querySelector('.account-name');
    var tAccountResource = tmpl.content.querySelector('.account-resource');
    var tButtonDelete = tmpl.content.querySelector('.account-btn-delete');
    var tButtonSetDefault = tmpl.content.querySelector('.account-btn-set-default');
    var tButtonShiftUp = tmpl.content.querySelector('.account-btn-shift-up');
    var tButtonShiftDown = tmpl.content.querySelector('.account-btn-shift-down');

    var tbody = document.querySelector('#accounts');
    $(tbody).empty();

    users.forEach(function(user, index) {
        tAccountAvatar.setAttribute('src', user.avatar);
        tAccountName.textContent = user.name;
        tAccountResource.textContent = user.resource;

        $(tButtonDelete).attr('data-user-id', index);
        $(tButtonSetDefault).attr('data-user-id', index);
        $(tButtonShiftUp).attr('data-user-id', index);
        $(tButtonShiftDown).attr('data-user-id', index);

        var tr = document.importNode(tmpl.content, true);
        if (_options.trackedUser && areUsersEqual(user, _options.trackedUser)) {
            $(tr).find('.account-btn-set-default').remove();
        }

        tbody.appendChild(tr);
    });

    $('.account-btn-delete').on('click', deleteUser);
    $('.account-btn-set-default').on('click', trackUser);
    $('.account-btn-shift-up').on('click', shiftUpUser);
    $('.account-btn-shift-down').on('click', shiftDownUser);
}

function restoreUpdateDelay(updateDelay) {
    var iUpdateDelay = document.querySelector('#input-update-delay');
    iUpdateDelay.value = updateDelay;
}

function restoreOptions() {
    restoreUserAccounts(_options.users);
    restoreUpdateDelay(_options.updateDelay);
}

function loadOptions() {
    chrome.storage.local.get({
        trackedUser: null,
        users: [],
        updateDelay: 10
    }, function(items) {
        _options.trackedUser = items.trackedUser;
        _options.users = items.users;
        _options.updateDelay = items.updateDelay;

        restoreOptions();
    });
}

function saveOptions(specialChanges) {
    chrome.storage.local.set({
        trackedUser: _options.trackedUser,
        users: _options.users,
        updateDelay: _options.updateDelay
    }, function() {
        if (specialChanges !== undefined) {
            chrome.runtime.sendMessage(specialChanges);
        }

        restoreOptions();
    });
}

function trackUser() {
    var userId = $(this).data('user-id');
    _options.trackedUser = _options.users[userId];
    saveOptions('changeTracked');
}

function swapUsers(indA, indB) {
    var tmp = _options.users[indA];
    _options.users[indA] = _options.users[indB];
    _options.users[indB] = tmp;
}

function shiftUpUser() {
    var userId = $(this).data('user-id');

    if (userId > 0) {
        swapUsers(userId - 1, userId);
        saveOptions();
    }
}

function shiftDownUser() {
    var userId = $(this).data('user-id');

    if (userId < _options.users.length - 1) {
        swapUsers(userId, userId + 1);
        saveOptions();
    }
}

function deleteUser() {
    var userId = $(this).data('user-id');
    _options.users.splice(userId, 1);
    saveOptions();
}

function saveModalUser() {
    var miAccountName = $('#input-account-name');
    var miResources = $('#input-account-resource');

    var userName = miAccountName.val();
    var resource = miResources.val();

    var requestUrl = '';
    switch (resource) {
    case 'Habrahabr':
        requestUrl = 'https://m.habrahabr.ru/users/';
        break;
    case 'Geektimes':
        requestUrl = 'https://m.geektimes.ru/users/';
        break;
    default:
        alert('Указан неподдерживаемый ресурс');
        return;
    }

    requestUrl += userName;

    getDom(requestUrl, function(err, dom) {
        if (err || !(dom instanceof HTMLDocument)) {
            alert('Невозможно сохранить данного пользователя');
            return;
        }

        var avatarSrc = dom.querySelector('.profile-page__user-avatar > img').src;

        _options.users.push({
            avatar: avatarSrc,
            name: userName,
            resource: resource
        });
        saveOptions();
        $('#modal-add-account').modal('hide');
    });
}

function saveUpdateDelay() {
    var iUpdateDelay = $('#input-update-delay');
    var newUpdateDelay = parseInt(iUpdateDelay.val(), 10);

    if (newUpdateDelay <= 0 || isNaN(newUpdateDelay)) {
        iUpdateDelay.parent().addClass('has-error');
    } else {
        iUpdateDelay.parent().removeClass('has-error');
        iUpdateDelay.parent().addClass('has-success');

        _options.updateDelay = newUpdateDelay;
        saveOptions('changeTracked');
    }
}

function setupModal() {
    var miAccountName = $('#input-account-name');
    var miResources = $('#input-account-resource');

    miAccountName.val('');
    miResources.val('Habrahabr');
}

// Disable form submittions
$('form').submit(false);
loadOptions();

$('#modal-add-account').on('show.bs.model', setupModal);
$('#modal-btn-save').on('click', saveModalUser);
$('#input-update-delay').on('keyup', saveUpdateDelay);