package com.websocketchatapp.chatlib;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.nio.file.Path;
import java.util.*;

@Service
public class ChatServiceImpl implements ChatService {

    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    @Autowired
    DataFileService dataFileService;

    @Autowired
    JdbcTemplate jdbcTemplate;

    @Override
    public void sendMessage(Integer to, MessageDto message) {
        jdbcTemplate.update("INSERT INTO messages (`channel_id`, `user_id`, `content`, `type`, `delete_flag`,`create_time`,`update_time`)" +
                "values (?,?,?,?,false, current_time, current_time)", to, message.getUserLogin(), message.getContent(), message.getType());
        message.setChannelId(to);

        String last_message = jdbcTemplate.queryForObject("select content from messages where channel_id =? order by id desc limit 1", new Object[]{to}, String.class);
        jdbcTemplate.update("update `chat_channel` set last_message=? " +
                "where id=?", last_message, to);
        simpMessagingTemplate.convertAndSend("/topic/messages", message);
    }

    @Override
    public PagingDto<Map<String, Object>> getListMessage(Integer page, Integer pageSize, Integer chatChanelId) {
        Integer total = jdbcTemplate.queryForObject("select count(*) from " +
                "(select * from messages ms where ms.channel_id = ? and ms.delete_flag is false) ms " +
                "inner join chat_channel cc on  cc.id = ms.channel_id " +
                "and cc.delete_flag is false", new Object[]{chatChanelId}, Integer.class);
        List<Map<String, Object>> listMessage = jdbcTemplate.queryForList("select cm.*, us.name as name from messages cm " +
                "join users us on us.id = cm.user_id " +
                "where cm.channel_id=? order by cm.create_time desc limit ? offset ?", chatChanelId, pageSize, page * pageSize);
        Collections.reverse(listMessage);
        PagingDto<Map<String, Object>> contentCustom = new PagingDto<>();

        contentCustom.setTotalPage(total);
        contentCustom.setCurrentPage(page);
        contentCustom.setData(listMessage);
        return contentCustom;
    }

    @Override
    public List<Map<String, Object>> fetchAllChannel(String userId) {
        return jdbcTemplate.queryForList("SELECT cc.* from `chat_channel` cc " +
                "join chat_channel_member cm on cm.channel_id = cc.id and cm.user_id=? order by update_time desc", userId);
    }

    @Override
    public void sendMessageFile(Integer to, MessageDto message) throws IOException {
        String fileName = StringUtils.cleanPath(UUID.randomUUID() + message.getAttachment().getOriginalFilename());

        String uploadDir = "chat-uploads/";

        String filepath = dataFileService.uploadSingleImage(uploadDir, fileName, message.getAttachment());

        jdbcTemplate.update("INSERT INTO messages (`channel_id`, `user_id`, `content`, `type`, `delete_flag`,`create_time`,`update_time`)" +
                "values (?,?,?,?,false, current_time, current_time)", to, message.getUserLogin(), filepath, message.getType());
        message.setChannelId(to);

        jdbcTemplate.update("update `chat_channel` set last_message=? " +
                "where id=?", message.getName() + " send to " + (message.getType() == 2 ? "attachment"
                : message.getType() == 3 ? "video"
                : message.getType() == 4 ? "file" : ""), to);
        message.setAttachment(null);
        message.setContent(filepath);
        simpMessagingTemplate.convertAndSend("/topic/messages", message);
    }

    @Override
    public void seenMessage(Integer to, String userId) {
        String last_id_message = jdbcTemplate.queryForObject("select id from messages where channel_id =? order by id desc limit 1", new Object[]{to}, String.class);
        jdbcTemplate.update("update `chat_channel_member` set last_seen_message_id=? " +
                "where id=? and user_id=?", last_id_message, to, userId);
    }
}
