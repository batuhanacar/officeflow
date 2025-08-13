package com.example.officeflow.controller;

import com.example.officeflow.dto.UserCreateDTO;
import com.example.officeflow.dto.UserViewDTO;
import com.example.officeflow.entity.User;
import com.example.officeflow.repository.UserRepository;
import com.example.officeflow.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository; // Listeleme için geçici olarak kullanıyoruz

    @PostMapping("/register")
    @PreAuthorize("hasAuthority('ROLE_TEAM_LEAD')")
    public ResponseEntity<User> registerUser(@Valid @RequestBody UserCreateDTO userCreateDTO) {
        User createdUser = userService.createUser(userCreateDTO);
        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_TEAM_LEAD')")
    public ResponseEntity<List<UserViewDTO>> getAllUsers() {
        List<UserViewDTO> users = userRepository.findAll().stream()
                .map(user -> new UserViewDTO(user.getId(), user.getFullName(), user.getUsername()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_TEAM_LEAD')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}