package com.example.officeflow.service;

import com.example.officeflow.dto.UserCreateDTO;
import com.example.officeflow.entity.User;
import com.example.officeflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User createUser(UserCreateDTO userCreateDTO) {
        if (userRepository.findByUsername(userCreateDTO.getUsername()).isPresent()) {
            throw new IllegalStateException("Bu kullanıcı adı zaten alınmış.");
        }

        User newUser = User.builder()
                .username(userCreateDTO.getUsername())
                .password(passwordEncoder.encode(userCreateDTO.getPassword()))
                .fullName(userCreateDTO.getFullName())
                .role(userCreateDTO.getRole())
                .build();

        return userRepository.save(newUser);
    }
}