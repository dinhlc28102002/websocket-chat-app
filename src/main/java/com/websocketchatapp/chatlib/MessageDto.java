package com.websocketchatapp.chatlib;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class MessageDto {
    private MultipartFile attachment;
    private String content;
    private int userLogin;
    private String name;
    private Integer channelId;
    private Integer type;
    private String create_time;
}
