// ==UserScript==
// @name         UserSearchbyTag
// @namespace    pr0
// @version      1.0.1
// @description  Search user by tag
// @author       5yn74x
// @match        https://pr0gramm.com/*
// @grant        none
// ==/UserScript==

function getUserSuggestions(prefix) {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    resolve(JSON.parse(this.responseText));
                } else {
                    reject(this);
                }
            }
        });

        xhr.open("GET", `https://pr0gramm.com/api/profile/suggest?prefix=${prefix}`);
        xhr.setRequestHeader("Accept", "application/json");
        xhr.send();
    });
}

function createDiv(users) {
    for (let i = 0; i < users.length; i++) {
        users[i] = `<a href="/user/${users[i]}">${users[i]}</a>`;
    }
    let elem = `
<div style="background: #2a2e31;padding: 5px; text-align: center;">
<span>${users.join(" ")}</span>
</div>
`;
    $('#main-view').prepend(elem);
}

(function() {
    let catchXHR = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        this.addEventListener('load', function() {
            if(this.responseURL.search(/tags=[a-zA-Z0-9]*\b/g) !== -1) {
                var searchedTags = this.responseURL.substring(this.responseURL.search(/tags=[a-zA-Z0-9]*\b/g), this.responseURL.length).replace("tags=", "");
                if (searchedTags.match(/^[a-zA-Z0-9]*$/)) {
                    getUserSuggestions(searchedTags).then(result => {
                        if (result.users.length >= 1) {
                            createDiv(result.users);
                        }
                    }).catch(console.error);
                }
            }
        });
        catchXHR.apply(this, arguments);
    };
})();
