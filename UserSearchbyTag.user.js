// ==UserScript==
// @name         UserSearchbyTag
// @namespace    pr0
// @version      0.1
// @description  Search user by tag tearch
// @author       5yn74x
// @match        https://pr0gramm.com/*
// @grant        none
// ==/UserScript==

function getLastPostDate(itemId, user, callback) {
    fetch(`https://pr0gramm.com/api/items/get?id=${itemId}&flags=15&user=${user}`)
        .then(function(response) {
            if (response.status == 200) {
                return response.json();
            }
        })
        .then(function(json) {
            if(!json) return;
            callback(json.items[0]);
        });
}

function createDiv(json, lastseen, badges) {
    let elem = `<div style="background: #2a2e31;padding: 5px;display: grid;grid-template-columns: repeat(3, 1fr);">
<span style="text-align: left;"><a href="/user/${json.user.name}" class="user um${json.user.mark}" id="su_name">${json.user.name}</a> | ${lastseen}</span>
<span style="text-align: center;">Benis: ${json.user.score}</span>
<span style="text-align: right;">${badges.join(" ")}</span>`;
    console.log(elem);
    if($('#su_name').html() !== json.user.name) {
        $('#main-view').prepend(elem);
    }
}

function finduser(username) {
    fetch("https://pr0gramm.com/api/profile/info?name=" + username + "&flags=15")
        .then(function(response) {
            if (response.status == 200) {
                return response.json();
            }
        })
        .then(function(json) {
            if(!json) return;
            var badges = [];
            json.badges.forEach(function(i) {
                badges.push('<img src="/media/badges/' + i.image + '" class="badge" alt="" style="width: 20px;">');
            });
            let lastseen;
            if(json.uploadCount) {
                getLastPostDate(json.uploads[0].id, json.user.name, cb =>{
                    if (json.commentCount === 0) {
                        let date = new Date(cb.created*1000);
                        lastseen = `<a title="/new/${cb.id}" href="https://pr0gramm.com/new/${cb.id}"><span class="pict">g</span> <small>${date.getDate()}.${date.getMonth() +1}.${date.getYear() -100} ${date.getHours()}:${date.getMinutes()}</small></a>`;
                        createDiv(json, lastseen, badges);
                    }
                    else if (cb.created > json.comments[0].created) {
                        let date = new Date(cb.created*1000);
                        lastseen = `<a title="/new/${cb.id}" href="https://pr0gramm.com/new/${cb.id}"><span class="pict">g</span> <small>${date.getDate()}.${date.getMonth() +1}.${date.getYear() -100} ${date.getHours()}:${date.getMinutes()}</small></a>`;
                        createDiv(json, lastseen, badges);
                    }
                    else {
                        let date = new Date(json.comments[0].created*1000);
                        lastseen = `<a title="/new/${json.comments[0].itemId}:comment${json.comments[0].id}" href="https://pr0gramm.com/new/${json.comments[0].itemId}:comment${json.comments[0].id}"><span class="pict">c</span> <small>${date.getDate()}.${date.getMonth() +1}.${date.getYear() -100} ${date.getHours()}:${date.getMinutes()}</small></a>`;
                        createDiv(json, lastseen, badges);
                    }
                });
            }
            if(json.uploadCount === 0 && json.commentCount !== 0) {
                let date = new Date(json.comments[0].created*1000);
                lastseen = `<a title="/new/${json.comments[0].itemId}:comment${json.comments[0].id}" href="https://pr0gramm.com/new/${json.comments[0].itemId}:comment${json.comments[0].id}"><span class="pict">c</span> <small>${date.getDate()}.${date.getMonth() +1}.${date.getYear() -100} ${date.getHours()}:${date.getMinutes()}</small></a>`;
                createDiv(json, lastseen, badges);
            } else if(json.commentCount === 0 && json.uploadCount === 0) {
                lastseen = `<small>Keine Beiträge</small>`;
                createDiv(json, lastseen, badges);
            }
        });
}


(function() {
    var catchXHR = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        this.addEventListener('load', function() {
            if(this.responseURL.search(/tags=[a-zA-Z0-9]*\b/g) !== -1) {
                var searchedTags = this.responseURL.substring(this.responseURL.search(/tags=[a-zA-Z0-9]*\b/g), this.responseURL.length).replace("tags=", "");
                if (searchedTags.match(/^[a-zA-Z0-9]*$/)) {
                    finduser(searchedTags);
                }
            }
        });
        catchXHR.apply(this, arguments);
    };
})();
