const url = "http://localhost:8080";
const user = JSON.parse(localStorage.getItem("user"));

$(function () {
    function templateChannel(channel) {
        console.log(channel)
        return `<div class="chat_list" data-channelid="${channel['id']}">
                            <div class="chat_people">
                                <div class="chat_img">
                                    <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil">
                                </div>
                                <div class="chat_ib">
                                    <p>${channel["last_message"]}</p>
                                </div>
                            </div>
                        </div>`
    }

    $("#chat").chatConnect({
        host: url, user,
        // templateChannel: templateChannel
    })
})
