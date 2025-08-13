package com.example.officeflow.service;

import com.example.officeflow.dto.UserCreateDTO;
import com.example.officeflow.dto.UserViewDTO;
import com.example.officeflow.entity.User;
import com.example.officeflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

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

    public List<UserViewDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(user -> new UserViewDTO(user.getId(), user.getFullName(), user.getUsername()))
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteUser(Long userId) {
        // Silinmek istenen kullanıcıyı bul
        User userToDelete = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("Kullanıcı bulunamadı: " + userId));

        // İşlemi yapan (giriş yapmış olan) kullanıcının bilgilerini al
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String currentUsername = ((UserDetails) principal).getUsername();

        // Kural: Kullanıcı kendini silemez.
        if (userToDelete.getUsername().equals(currentUsername)) {
            throw new IllegalStateException("Kendinizi silemezsiniz.");
        }

        // TODO: Bu kullanıcıya atanmış görevlerin ne olacağına karar ver.
        // Şimdilik, görevleri varsa silme işlemi hata verebilir (foreign key constraint).
        // Bu sorunu çözmek için TaskRepository'yi buraya inject edip,
        // ilgili görevlerin assignee'sini null yapabiliriz.

        userRepository.deleteById(userId);
    }
}