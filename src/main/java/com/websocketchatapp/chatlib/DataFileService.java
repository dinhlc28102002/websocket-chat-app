package com.websocketchatapp.chatlib;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;

public interface DataFileService {
    String uploadSingleImage(String uploadDir, String fileName,
                    MultipartFile multipartFile) throws IOException;
}
