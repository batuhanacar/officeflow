package com.example.officeflow.config;

import com.example.officeflow.entity.Role;
import com.example.officeflow.entity.User;
import com.example.officeflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Veritabanında hiç kullanıcı yoksa ilk ve tek yöneticiyi oluştur
        if (userRepository.count() == 0) {
            System.out.println("--- Veritabanı boş, ilk yönetici kullanıcı oluşturuluyor... ---");

            User adminUser = User.builder()
                    .username("admin")
                    .fullName("Görkem Özçelik")
                    .password(passwordEncoder.encode("501324Hsgm"))
                    .role(Role.ROLE_TEAM_LEAD)
                    .build();
            userRepository.save(adminUser);

            System.out.println("\n--- Kurulum Tamamlandı! ---");
            System.out.println("Yönetici kullanıcı başarıyla oluşturuldu.");
            System.out.println("Giriş Bilgileri:");
            System.out.println("Kullanıcı Adı: admin");
            System.out.println("Şifre: 501324Hsgm\n");
        }
    }
}