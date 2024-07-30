package com.websocketchatapp.chatlib;

import org.springframework.web.bind.annotation.PathVariable;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

public interface ChatService {
    void sendMessage(Integer to, MessageDto message);

    PagingDto<Map<String, Object>> getListMessage(Integer page, Integer pageSize, @PathVariable("chat_chanel_id") Integer chatChanelId);

    List<Map<String, Object>> fetchAllChannel(String userId);

    void sendMessageFile(Integer to, MessageDto message) throws IOException;

    void seenMessage(Integer to, String userId);
}