package com.example.officeflow.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TaskCreateDTO {

    @NotBlank(message = "Başlık boş olamaz.")
    @Size(min = 3, max = 100, message = "Başlık 3 ile 100 karakter arasında olmalıdır.")
    private String title;

    @Size(max = 1000, message = "Açıklama 1000 karakterden uzun olamaz.")
    private String description;

    @NotNull(message = "Görevin atanacağı kullanıcı ID'si boş olamaz.")
    private Long assigneeId;

    @NotNull(message = "Son teslim tarihi boş olamaz.") // Artık zorunlu
    @FutureOrPresent(message = "Son teslim tarihi geçmiş bir tarih olamaz.") // Kuralı geri ekledik
    private LocalDateTime dueDate;
}