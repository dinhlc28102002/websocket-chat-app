package com.websocketchatapp.chatlib;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin
public class ChatController {

    @Autowired
    ChatService chatService;

    @MessageMapping("/chat/{channelId}")
    public void sendMessage(@DestinationVariable Integer channelId, MessageDto message) {
        chatService.sendMessage(channelId, message);
    }

    @GetMapping("/fetchAllChannel/{userId}")
    public List<Map<String, Object>> fetchAllChannel(@PathVariable("userId") String userId) {
        return chatService.fetchAllChannel(userId);
    }

    @GetMapping("/listmessage/{channelId}")
    public PagingDto<Map<String, Object>> getListMessageToChannel(@PathVariable("channelId") Integer channelId,
                                                                  @RequestParam(name = "page", required = false, defaultValue = "1") Integer page,
                                                                  @RequestParam(name = "pageSize", defaultValue = "10") Integer pageSize) {
        return chatService.getListMessage(page - 1 , pageSize, channelId);
    }

    @PostMapping("/{channelId}/send-file")
    public void sendFile(@PathVariable("channelId") Integer channelId,
                         @ModelAttribute MessageDto messageForm) throws IOException {
        chatService.sendMessageFile(channelId, messageForm);
    }
}
