package com.websocketchatapp.chatlib;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.List;

@Getter
@Setter
public class PagingDto<T> implements Serializable {

    private Integer totalPage;
    private Integer total;
    private Integer currentPage;
    private Integer limitOfPage;
    private List<T> data;
}
