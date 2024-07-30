// (function ($) {
//     let stompClient;
//     let selectedChannel = "";
//     let newMessages = new Map();
//
//     $.fn.connectChat = function (url, linkChannel, subscribe, user) {
//         let socket = new SockJS(url + '/ws');
//         stompClient = Stomp.over(socket);
//         console.log(stompClient)
//         stompClient.connect({}, function () {
//             $.get(url + linkChannel + user.userId, function (response) {
//                 let groups = response;
//                 for (let i = 0; i < groups.length; i++) {
//                     stompClient.subscribe(subscribe + groups[i]["id"], function (response) {
//                         let data = JSON.parse(response.body);
//
//                         if (selectedChannel == data.groupId && user.userId != data.userLogin) {
//                             console.log("selectedChannelOrGrup === data.fromLogin")
//                             console.log("data: ", data)
//                             let messageTemplateHTML = ""
//                             messageTemplateHTML = messageTemplateHTML + '<div id="child_message" class="received_msg">' +
//                                 '<div class="received_msg_img">' +
//                                 '<img src="https://ptetutorials.com/images/user-profile.png" alt="sunil">' +
//                                 '</div>' +
//                                 '<div class="received_msg">' +
//                                 '<div class="received_width_msg">' +
//                                 '<p class="name">' +
//                                 data.name +
//                                 '</p>' +
//                                 '<p class="content">' +
//                                 data.content +
//                                 '</p>' +
//                                 '<span class="time_date">' +
//                                 $().formatDateTime(data.createTime) +
//                                 '</span>' +
//                                 '</div>' +
//                                 '</div>' +
//                                 '</div>';
//                             $('#msg_history').append(messageTemplateHTML).stop().animate({scrollTop: $("#msg_history")[0].scrollHeight}, 0);
//                             console.log("append success")
//                         } else {
//                             newMessages.set(data.groupId, data.message);
//                             $('#userGroupAppender_' + data.groupId).append('<span id="newMessage_' + data.groupId + '" style="color: red">+1</span>');
//
//                             console.log("kebuat")
//                             console.log("data.groupId: ", data.groupId)
//                             console.log("selectedChannel: ", selectedChannel)
//                             let messageTemplateHTML = "";
//                             messageTemplateHTML = messageTemplateHTML + '<div id="child_message" class="d-flex justify-content-end mb-4">' +
//                                 '<div class="msg_cotainer_send">' + data.content +
//                                 '</div>' +
//                                 '</div>';
//                             console.log("append success")
//                         }
//                     })
//                 }
//             });
//         });
//     };
//
//     $.fn.getMessageChannel = function (id, linkListMessage, url) {
//         let buttonSend = document.getElementById("btn-send");
//         if (buttonSend !== null) {
//             buttonSend.parentNode.removeChild(buttonSend);
//         }
//         $(".chat_list").removeClass("active_chat")
//
//         $(`[data-groupid=${id}]`).addClass("active_chat")
//
//         // let isNew = document.getElementById("newMessage_" + id) !== null;
//         // if (isNew) {
//         //     let element = document.getElementById("newMessage_" + id);
//         //     element.parentNode.removeChild(element);
//         //
//         //
//         // }
//         selectedChannel = $(".active_chat").attr("data-groupid");
//
//         let isHistoryMessage = document.getElementById("msg_history");
//         if (isHistoryMessage !== null && isHistoryMessage.hasChildNodes()) {
//             isHistoryMessage.innerHTML = "";
//
//         }
//
//         console.log("url + linkListMessage + id", url + linkListMessage + id)
//
//         $.get(url + linkListMessage + id, function (response) {
//             let messagesGroup = response;
//             let messageGroupTemplateHTML = "";
//             for (let i = 0; i < messagesGroup.length; i++) {
//                 // console.log(messagesGroup[i]['messages'])
//                 if (messagesGroup[i]['user_id'] == user.userId) {
//                     messageGroupTemplateHTML = messageGroupTemplateHTML + '<div class="me_msg" id="child_message">' +
//                         '<div class="sent_msg">' +
//                         '<p>' +
//                         messagesGroup[i]['content'] +
//                         '</p>' +
//                         '<span class="time_date">' +
//                         $().formatDateTime(messagesGroup[i]['create_time']) +
//                         '</span>' +
//                         '</div>' +
//                         '</div>';
//                 } else {
//                     messageGroupTemplateHTML = messageGroupTemplateHTML + '<div id="child_message" class="received_msg">' +
//                         '<div class="received_msg_img">' +
//                         '<img src="https://ptetutorials.com/images/user-profile.png" alt="sunil">' +
//                         '</div>' +
//                         '<div class="received_msg">' +
//                         '<div class="received_width_msg">' +
//                         '<p class="name">' +
//                         messagesGroup[i]['name'] +
//                         '</p>' +
//                         '<p class="content">' +
//                         messagesGroup[i]['content'] +
//                         '</p>' +
//                         '<span class="time_date">' +
//                         $().formatDateTime(messagesGroup[i]['create_time']) +
//                         '</span>' +
//                         '</div>' +
//                         '</div>' +
//                         '</div>';
//                 }
//             }
//             $('#msg_history').append(messageGroupTemplateHTML).stop().animate({scrollTop: $("#msg_history")[0].scrollHeight}, 0);
//
//         });
//
//         let submitButton = '<button type="button" class="msg_send_btn" id="btn-send" onclick="$().sendMessage(`TEXT`)"><i class="fa fa-paper-plane-o" aria-hidden="true"></i></button>';
//         $('#formSubmit').append(submitButton)
//     }
//
//     $.fn.fetchAllChannel = function (url, linkChannel, userId, linkListMessage) {
//         console.log(url, linkListMessage)
//         $.get(url + linkChannel + userId, function (response) {
//             let groups = response;
//             let groupsTemplateHTML = "";
//             for (let i = 0; i < groups.length; i++) {
//                 groupsTemplateHTML += '<div class="chat_list" onclick="$().getMessageChannel(' + groups[i]['id'] + ',\'' + linkListMessage + '\', \'' + url + '\')" data-groupid="' + groups[i]['id'] + '">' +
//                     '<div class="chat_people">' +
//                     '<div class="chat_img">' +
//                     '<img src="https://ptetutorials.com/images/user-profile.png" alt="sunil">' +
//                     '</div>' +
//                     '<div class="chat_ib">' +
//                     '<h5>' + groups[i]['name'] + '<span class="chat_date">Dec 25</span></h5>' +
//                     '<p>Test, which is a new approach to have all solutions astrology under one roof.</p>' +
//                     '</div>' +
//                     '</div>' +
//                     '</div>'
//             }
//             $('#inbox-chat').html(groupsTemplateHTML);
//         });
//     };
//
//     $.fn.create = function (url, user, linkChannel, subscribe, linkListMessage) {
//         this[0].innerHTML = `<div class="row mt-3 border">
//             <div class="col-lg-5 border-right p-0">
//                 <div class="headind_srch">
//                     <div class="recent_heading">
//                         <h4 class="test">Recent</h4>
//                     </div>
//                     <div class="srch_bar">
//                         <div class="stylish-input-group">
//                             <input type="text" class="search-bar" placeholder="Search">
//                             <span class="input-group-addon">
//                                 <button type="button"> <i class="fa fa-search" aria-hidden="true"></i> </button>
//                             </span>
//                         </div>
//                     </div>
//                 </div>
//
//                 <div class="inbox_chat" id="inbox-chat">
//                 </div>
//             </div>
//             <div class="col-lg-7 mesgs">
//                 <div class="msg_history" id="msg_history">
//                 </div>
//
//                 <div class="type_msg">
//                     <div class="input_msg_write" id="formSubmit">
//                         <input type="text" class="write_msg" placeholder="Type a message" id="message-to-send">
//                     </div>
//                 </div>
//             </div>
//         </div>`
//
//         this.connectChat(url, linkChannel, subscribe, user)
//         this.fetchAllChannel(url, linkChannel, user.userId, linkListMessage)
//     }
//
//   $.fn.sendMessage = function (type){
//         let username = $('.active_chat').attr("data-groupid");
//         let message = $('#message-to-send').val();
//         selectedChannel = username;
//
//         if(message.trim() !== "") {
//             stompClient.send("/app/chat/" + selectedChannel, {}, JSON.stringify({
//                 userLogin: user.userId,
//                 content: message,
//                 name: user.name,
//                 type,
//                 groupId: username,
//                 createTime: new Date()
//             }));
//         }
//
//         let messageTemplateHTML = "";
//         messageTemplateHTML = messageTemplateHTML + '<div class="me_msg" id="child_message">' +
//             '<div class="sent_msg">' +
//             '<p>' +
//             message +
//             '</p>' +
//             '<span class="time_date">' +
//             $().formatDateTime(new Date()) +
//             '</span>' +
//             '</div>' +
//             '</div>';
//         $('#msg_history').append(messageTemplateHTML).stop().animate({ scrollTop: $("#msg_history")[0].scrollHeight}, 0);
//         $('#message-to-send').val("")
//     }
//
//     $.fn.formatDateTime = function (dateTime) {
//         let date = new Date(dateTime);
//
//         let year = date.getFullYear();
//         let month = ('0' + (date.getMonth() + 1)).slice(-2);
//         let day = ('0' + date.getDate()).slice(-2);
//         let hours = ('0' + date.getHours()).slice(-2);
//         let minutes = ('0' + date.getMinutes()).slice(-2);
//         let seconds = ('0' + date.getSeconds()).slice(-2);
//
//         return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
//     }
//
// })(jQuery);