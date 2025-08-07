package com.example.officeflow.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TaskCreateDTO {
    @NotBlank(message = "Başlık boş olamaz")
    private String title;

    private String description;

    @NotNull(message = "Görevin atanacağı kullanıcı ID'si boş olamaz")
    private Long assigneeId;

    @FutureOrPresent(message = "Son teslim tarihi geçmiş bir tarih olamaz")
    private LocalDateTime dueDate;
}