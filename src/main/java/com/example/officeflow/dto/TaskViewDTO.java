package com.example.officeflow.dto;

import com.example.officeflow.entity.TaskStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TaskViewDTO {
    private Long id;
    private String title;
    private String description;
    private TaskStatus status;
    private LocalDateTime createdDate;
    private LocalDateTime dueDate;
    private UserViewDTO assignee;
}