package com.example.officeflow.dto;

import com.example.officeflow.entity.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserCreateDTO {

    @NotBlank(message = "Kullanıcı adı boş olamaz")
    private String username;

    @NotBlank(message = "Şifre boş olamaz")
    private String password;

    @NotBlank(message = "Tam ad boş olamaz")
    private String fullName;

    @NotNull(message = "Rol boş olamaz")
    private Role role;
}