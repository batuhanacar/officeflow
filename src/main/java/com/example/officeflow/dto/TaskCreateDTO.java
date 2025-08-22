package com.example.officeflow.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;

@Data
public class TaskCreateDTO {
    @NotBlank
    private String title;
    private String description;
    @NotNull
    private LocalDateTime dueDate;
    @NotEmpty
    private Set<Long> assigneeIds;
}