(function ($) {
    let defaults = {
        host: "http://localhost:8080",
        user: {userId: 0, name: ""},
        token: "",
        stompClient: null,
        selectedChannel: "",
        newMessages: new Map(),
        subscribe: "/topic/messages",
        urlChannel: "/fetchAllChannel/",
        urlMessage: "/listmessage/",
        sendChat: "/app/chat/",
        search: false,
        templateLeft: null,
        templateRight: null,
        templateChannel: null,
        templateMeMsg: null,
        templateYouMsg: null,
        templateMeImg: null,
        templateYouImg: null,
        templateMeVideo: null,
        templateYouVideo: null,
        templateMeFile: null,
        templateYouFile: null,
        channelList: [],
        currentPage: 1,
        lastPage: 1,
        scrollHeight: 0,
        pageSize: 10,
    }
    const TYPE_MESSAGE = {
        TEXT: 1,
        IMAGE: 2,
        VIDEO: 3,
        FILE: 4,
    }


    $.fn.chatConnect = function (options) {
        if (this.length === 0) {
            return this;
        }

        let chat = {}
        el = this;
        if ($(el).data('chatConnect')) {
            return;
        }

        const init = function () {
            if ($(el).data('chatConnect')) {
                return;
            }
            chat = $.extend({}, defaults, options)
            renderTemplate()

            let socket = new SockJS(chat.host + '/ws');
            chat.stompClient = Stomp.over(socket);
            chat.stompClient.connect(chat.token ? {"X-Authorization": chat.token} : {}, function () {
                // $.get(chat.host + chat.urlChannel + chat.user.userId, function (response) {
                //     let channel = response;
                //     for (let i = 0; i < channel.length; i++) {
                //
                //     }
                // })

                chat.stompClient.subscribe(chat.subscribe , function (response) {
                    let data = JSON.parse(response.body);
                    if (chat.selectedChannel == data.channelId) {
                        console.log("selectedChannel === data.fromLogin")
                        console.log("data: ", data)
                        onAppendChatBox(data)
                        onScrollToBottom();
                        console.log("append success")
                    }
                    onGetChannels();
                })
            })

            $("#btn-send").click(function () {
                if ($('#message-to-send').val().trim() === '') return;
                sendMessage();
            })

            $(document).on('keypress', function (e) {
                if (e.which == 13 && $('#message-to-send').val().trim() !== '' && chat.selectedChannel) {
                    $("#btn-send").trigger("click")
                }
            });

            $("#files-input").on("click", function (e) {
                e.target.value = null
            }).on("change", function ({target: {files}}) {
                if (files.length) {
                    const {type} = files[0]
                    let typeFile
                    switch (type) {
                        case 'image/png':
                        case 'image/jpeg':
                        case 'image/jpg':
                            typeFile = TYPE_MESSAGE.IMAGE
                            break
                        case 'video/mp4':
                        case 'video/quicktime':
                            typeFile = TYPE_MESSAGE.VIDEO
                            break
                        case 'application/msword':
                        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                        case 'application/vnd.ms-excel':
                        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                        case 'application/pdf':
                            typeFile = TYPE_MESSAGE.FILE
                            break
                    }
                    if (!typeFile) {
                        return
                    }
                    sendMessage(files[0], typeFile)
                }
            })
        }

        function sendMessage(attachment, type) {
            let content = $('#message-to-send');

            const data = {
                userLogin: chat.user.userId,
                content: content.val(),
                name: chat.user.name,
                type: TYPE_MESSAGE.TEXT,
                channelId: chat.selectedChannel,
                create_time: new Date()
            }

            const fileData = attachment ? {attachment} : {}

            const formData = new FormData()
            formData.append('attachment', attachment)
            formData.append('type', type)
            formData.append("userLogin", chat.user.userId)
            formData.append("name", chat.user.name)
            formData.append("channelId", chat.selectedChannel)
            formData.append("create_time", new Date())

            if (Object.keys(fileData).length > 0) {
                $.ajax({
                    type: 'POST',
                    url: chat.host + `/${chat.selectedChannel}/send-file`,
                    data: formData,
                    contentType: false,
                    processData: false,
                    success: function (response) {
                        console.log(response)
                    },
                    error: function (error) {
                        console.log(error);
                    }
                });
            } else {
                if (content.val().trim() !== "") {
                    chat.stompClient.send(chat.sendChat + chat.selectedChannel, {}, JSON.stringify(data));
                }
                content.val("")
            }

        }

        function onScrollToBottom() {
            Promise.all(
                [...Array.from(document.images)
                    .filter((img) => !img.complete)
                    .map(
                        (img) =>
                            new Promise((resolve) => {
                                img.onload = img.onerror = resolve
                            }),
                    ), Array.from(document.getElementsByTagName("video"))
                    .filter((video) => !video.complete)
                    .map(
                        (video) =>
                            new Promise((resolve) => {
                                video.onloadeddata = video.onerror = resolve
                            }),
                    )],
            ).finally(() => {
                const $messageList = $("#message_list")
                $messageList.scrollTop($messageList[0].scrollHeight)
            })
        }

        const renderTemplate = async function () {
            $(el).html(`<div class="row mt-3 border">
                <div class="col-lg-5 border-right p-0">
                    ${chat.templateLeft ? chat.templateLeft?.() : templateLeftDefault()}
                </div>
                <div class="col-lg-7 mesgs">
                    ${chat.templateRight ? chat.templateRight?.() : templateRightDefault()}
                </div>
            </div>`)
            onGetChannels();
            $('#inbox-chat').on('click', '.chat_list', function () {
                chat.selectedChannel = $(this).data('channelid')
                $("#btn-send").removeAttr("hidden");
                $(".chat_list").removeClass("active_chat")
                $(this).addClass("active_chat");
                onLoadChatMessage();
            });
        }

        function onGetChannels() {
            $.get(chat.host + chat.urlChannel + chat.user.userId, function (response) {
                let channel = response;
                if (channel.length) {
                    chat.channelList = channel
                    onRenderChannel();
                }
            });
        }

        function onRenderChannel() {
            $('#inbox-chat').html("")
            chat.channelList.forEach((item) => {
                renderChannel({...item})
            })
        }

        function renderChannel(data) {
            let channelHTML = chat.templateChannel ? chat.templateChannel?.(data) : templateChannelDefault(data);
            $('#inbox-chat').append(channelHTML);
            if (chat.selectedChannel) $(`*[data-channelid="${chat.selectedChannel}"]`).addClass("active_chat")
        }

        function onAppendChatBox(item) {
            $("#message_list").append(doGenerateMessage(item))
        }

        async function onLoadChatMessage() {
            chat.currentPage = 1;
            let containerChat = $("#message_list")[0];
            $("#message_list").off("scroll")
            if (containerChat !== null && $(containerChat).children().length > 0) {
                $(containerChat).html("");
            }
            await onGetMessage(chat.selectedChannel, chat.currentPage, true)

            if (containerChat.scrollHeight === containerChat.clientHeight && Math.ceil(chat.lastPage / 10) > chat.currentPage) {
                chat.currentPage += 1
                await onGetMessage(chat.selectedChannel, chat.currentPage)
            }

            $("#message_list").scrollTop(containerChat.scrollHeight)
            chat.scrollHeight = containerChat.scrollHeight
            $("#message_list").on('scroll', eventScroll)
        }

        async function onGetMessage(channelId, page, isScrollToBottom = false) {
            await $.get(chat.host + chat.urlMessage + chat.selectedChannel + (page ? '?page=' + page : '') + '&pageSize=' + chat.pageSize, function (response) {
                chat.lastPage = response.totalPage
                let messageGroupTemplateHTML = response.data
                    .map((item) => doGenerateMessage(item))
                    .join('');
                if (isScrollToBottom === true) {
                    $('#message_list').append(messageGroupTemplateHTML).scrollTop($("#message_list")[0].scrollHeight)
                    onScrollToBottom();
                } else {
                    $('#message_list').prepend(messageGroupTemplateHTML)
                }
            });
        }

        $('#message_list').on("scroll", eventScroll)

        async function eventScroll(event) {
            const containerChat = $('#message_list')[0]
            if (event.target.scrollTop === 0 && Math.ceil(chat.lastPage / 10) > chat.currentPage) {
                chat.currentPage += 1
                await onGetMessage(chat.selectedChannel, chat.currentPage)
                chat.scrollHeight = containerChat.scrollHeight - chat.scrollHeight
                $("#message_list").scrollTop(chat.scrollHeight)
                chat.scrollHeight = containerChat.scrollHeight
            }
        }

        function doGenerateMessage(data) {
            switch (data.type) {
                case 1:
                    if (data.userLogin == chat.user.userId || data.user_id == chat.user.userId) {
                        return chat.templateMeMsg ? chat.templateMeMsg?.(data) : templateMeMsgDefault(data)
                    } else {
                        return chat.templateYouMsg ? chat.templateYouMsg?.(data) : templateYouMsgDefault(data);
                    }
                case 2:
                    if (data.userLogin == chat.user.userId || data.user_id == chat.user.userId) {
                        return chat.templateMeImg ? chat.templateMeImg?.(data) : templateMeMsgImgDefault(data);
                    } else {
                        return chat.templateYouImg ? chat.templateYouImg?.(data) : templateYouMsgImgDefault(data);
                    }
                case 3:
                    if (data.userLogin == chat.user.userId || data.user_id == chat.user.userId) {
                        return chat.templateMeVideo ? chat.templateMeVideo?.(data) : templateMeMsgVideoDefault(data);
                    } else {
                        return chat.templateMeVideo ? chat.templateMeVideo?.(data) : templateYouMsgVideoDefault(data);
                    }
                case 4:
                    if (data.userLogin == chat.user.userId || data.user_id == chat.user.userId) {
                        return chat.templateMeFile ? chat.templateMeFile?.(data) : templateMeMsgFileDefault(data);
                    } else {
                        return chat.templateMeVideo ? chat.templateMeVideo?.(data) : templateYouMsgFileDefault(data);
                    }
            }
        }

        function templateLeftDefault() {
            return `
                <div class="inbox_chat" id="inbox-chat">
                </div>
            `
        }

        function templateRightDefault() {
            return `
                <div class="message_list" id="message_list">
                </div>
                <div class="type_msg">
                    <div class="input_msg_write" id="formSubmit">
                        <label class="btn-file" id="files-input" for="file-upload">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 448 512">
                                <path d="M364.2 83.8c-24.4-24.4-64-24.4-88.4 0l-184 184c-42.1 42.1-42.1 110.3 0 152.4s110.3 42.1 152.4 0l152-152c10.9-10.9 28.7-10.9 39.6 0s10.9 28.7 0 39.6l-152 152c-64 64-167.6 64-231.6 0s-64-167.6 0-231.6l184-184c46.3-46.3 121.3-46.3 167.6 0s46.3 121.3 0 167.6l-176 176c-28.6 28.6-75 28.6-103.6 0s-28.6-75 0-103.6l144-144c10.9-10.9 28.7-10.9 39.6 0s10.9 28.7 0 39.6l-144 144c-6.7 6.7-6.7 17.7 0 24.4s17.7 6.7 24.4 0l176-176c24.4-24.4 24.4-64 0-88.4z"/>
                            </svg>
                            <input type="file" name="file" id="file-upload" hidden>
                        </label>
                        <input type="text" class="write_msg" placeholder="Type a message" id="message-to-send">
                        <button type="button" class="msg_send_btn" hidden id="btn-send"><i class="fa fa-paper-plane-o" aria-hidden="true"></i></button>
                    </div>
                </div>
            `
        }

        function templateChannelDefault(channel) {
            return `<div class="chat_list" data-channelid="${channel.id}">
                        <div class="chat_people">
                            <div class="chat_ib">
                                <h5>${channel.name}<span class="chat_date">${formatDateTime(channel.update_time)}</span></h5>
                                <p>${channel.last_message}</p>
                            </div>
                        </div>
                    </div>`;
        }

        function templateMeMsgDefault(messageChannel) {
            return `<div class="me_msg">
                        <p class="content">${messageChannel.content}</p>
                        <span class="time_date">${formatDateTime(messageChannel.create_time)}</span>
                    </div>`
        }

        function templateYouMsgDefault(messageChannel) {
            return `<div class="received_msg">
                        <p class="name">${messageChannel.name}</p>
                        <p class="content">${messageChannel.content}</p>
                        <span class="time_date">${formatDateTime(messageChannel.create_time)}</span>
                    </div>`
        }

        function templateMeMsgImgDefault(messageChannel) {
            return `<div class="me_msg">
                        <div>
                            <a class="popup-link block" href="${messageChannel.content}" target="_blank">
                                <img class="" src="${messageChannel.content}" />
                            </a>
                            <span class="time_date">${formatDateTime(messageChannel['create_time'])}</span>
                        </div>
                    </div>`
        }

        function templateYouMsgImgDefault(messageChannel) {
            return `<div class="received_msg"> 
                        <p class="name">${messageChannel['name']}</p>
                        <a class="popup-link block" href="${messageChannel.content}" target="_blank">
                            <img class="none-valid" src="${messageChannel.content}"/>
                        </a>
                        <span class="time_date">${formatDateTime(messageChannel['create_time'])}</span>
                    </div>`
        }

        function templateYouMsgVideoDefault(messageChannel) {
            return `
                <div class="received_msg"> 
                    <p class="name">${messageChannel['name']}</p>
                    <video width="320" height="240" controls>
                      <source src="${messageChannel.content}" type="video/mp4">
                      Your browser does not support the video tag.
                    </video>
                    <span class="time_date">${formatDateTime(messageChannel['create_time'])}</span>
                </div>
            `
        }

        function templateMeMsgVideoDefault(messageChannel) {
            return `
                <div class="me_msg">
                    <div>
                        <video width="320" height="240" controls>
                          <source src="${messageChannel.content}" type="video/mp4">
                          Your browser does not support the video tag.
                        </video>
                        <span class="time_date">${formatDateTime(messageChannel['create_time'])}</span>
                    </div>
                </div>
            `
        }

        function templateYouMsgFileDefault(messageChannel) {
            return `
                <div class="received_msg">
                    <p class="name">${messageChannel['name']}</p>
                    <a class="popup-link block" href="${messageChannel.content}" target="_blank">
                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 128 128">
                            <path d="M 33.5 9 C 26.3 9 20.5 14.8 20.5 22 L 20.5 102 C 20.5 109.2 26.3 115 33.5 115 L 94.5 115 C 101.7 115 107.5 109.2 107.5 102 L 107.5 22 C 107.5 14.8 101.7 9 94.5 9 L 33.5 9 z M 33.5 15 L 94.5 15 C 98.4 15 101.5 18.1 101.5 22 L 101.5 102 C 101.5 105.9 98.4 109 94.5 109 L 33.5 109 C 29.6 109 26.5 105.9 26.5 102 L 26.5 22 C 26.5 18.1 29.6 15 33.5 15 z M 33.5 22 L 33.5 37 L 94.5 37 L 94.5 22 L 33.5 22 z M 37.5 51 C 35.8 51 34.5 52.3 34.5 54 C 34.5 55.7 35.8 57 37.5 57 L 88.5 57 C 90.2 57 91.5 55.7 91.5 54 C 91.5 52.3 90.2 51 88.5 51 L 37.5 51 z M 37.5 66 C 35.8 66 34.5 67.3 34.5 69 C 34.5 70.7 35.8 72 37.5 72 L 88.5 72 C 90.2 72 91.5 70.7 91.5 69 C 91.5 67.3 90.2 66 88.5 66 L 37.5 66 z M 37.5 81 C 35.8 81 34.5 82.3 34.5 84 C 34.5 85.7 35.8 87 37.5 87 L 64 87 C 65.7 87 67 85.7 67 84 C 67 82.3 65.7 81 64 81 L 37.5 81 z"></path>
                        </svg>
                    </a>
                    <span class="time_date">${formatDateTime(messageChannel['create_time'])}</span>
               </div>
            `
        }

        function templateMeMsgFileDefault(messageChannel) {
            return `
                <div class="me_msg">
                    <div>
                        <a class="popup-link block" href="${messageChannel.content}" target="_blank">
                            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 128 128">
                                <path d="M 33.5 9 C 26.3 9 20.5 14.8 20.5 22 L 20.5 102 C 20.5 109.2 26.3 115 33.5 115 L 94.5 115 C 101.7 115 107.5 109.2 107.5 102 L 107.5 22 C 107.5 14.8 101.7 9 94.5 9 L 33.5 9 z M 33.5 15 L 94.5 15 C 98.4 15 101.5 18.1 101.5 22 L 101.5 102 C 101.5 105.9 98.4 109 94.5 109 L 33.5 109 C 29.6 109 26.5 105.9 26.5 102 L 26.5 22 C 26.5 18.1 29.6 15 33.5 15 z M 33.5 22 L 33.5 37 L 94.5 37 L 94.5 22 L 33.5 22 z M 37.5 51 C 35.8 51 34.5 52.3 34.5 54 C 34.5 55.7 35.8 57 37.5 57 L 88.5 57 C 90.2 57 91.5 55.7 91.5 54 C 91.5 52.3 90.2 51 88.5 51 L 37.5 51 z M 37.5 66 C 35.8 66 34.5 67.3 34.5 69 C 34.5 70.7 35.8 72 37.5 72 L 88.5 72 C 90.2 72 91.5 70.7 91.5 69 C 91.5 67.3 90.2 66 88.5 66 L 37.5 66 z M 37.5 81 C 35.8 81 34.5 82.3 34.5 84 C 34.5 85.7 35.8 87 37.5 87 L 64 87 C 65.7 87 67 85.7 67 84 C 67 82.3 65.7 81 64 81 L 37.5 81 z"></path>
                            </svg>
                        </a>
                        <span class="time_date">${formatDateTime(messageChannel['create_time'])}</span>
                    </div>
                </div>
            `
        }

        function formatDateTime(dateTime) {
            const date = new Date(dateTime);
            const currentDate = new Date();

            const year = date.getFullYear();
            const month = ('0' + (date.getMonth() + 1)).slice(-2);
            const day = ('0' + date.getDate()).slice(-2);
            const hours = ('0' + date.getHours()).slice(-2);
            const minutes = ('0' + date.getMinutes()).slice(-2);
            const seconds = ('0' + date.getSeconds()).slice(-2);


            return date.getDate() === currentDate.getDate()
                ? `${hours}:${minutes}:${seconds}`
                : `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
        }

        init()
    }
}(jQuery))