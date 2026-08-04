package com.ecommerce.user_service.config;

import com.ecommerce.user_service.model.Role;
import com.ecommerce.user_service.model.User;
import com.ecommerce.user_service.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Creates the initial ADMIN account from config on startup, so an admin
 * exists before any management UI can be used. No-op if an admin already exists.
 */
@Component
public class AdminBootstrap implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String email;
    private final String password;
    private final String firstName;
    private final String lastName;

    public AdminBootstrap(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.email:admin@atelier.dev}") String email,
            @Value("${app.admin.password:admin123456}") String password,
            @Value("${app.admin.firstName:Store}") String firstName,
            @Value("${app.admin.lastName:Admin}") String lastName) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    @Override
    public void run(String... args) {
        if (userRepository.findFirstByRole(Role.ADMIN).isPresent()) {
            log.info("Admin bootstrap: an ADMIN user already exists — skipping");
            return;
        }
        User admin = User.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .firstName(firstName)
                .lastName(lastName)
                .role(Role.ADMIN)
                .build();
        userRepository.save(admin);
        log.info("Admin bootstrap: created admin user {}", email);
    }
}
