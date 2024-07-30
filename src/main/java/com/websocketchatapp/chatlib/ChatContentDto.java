package com.websocketchatapp.chatlib;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class ChatContentDto {
    private int id;

    private int channelId;

    private int userId;

    private String name;

    private String content;

    private int type;

    private boolean deleteFlag;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
