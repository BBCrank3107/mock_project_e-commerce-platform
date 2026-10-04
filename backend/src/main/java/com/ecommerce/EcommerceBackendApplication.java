package com.ecommerce;

import com.ecommerce.modules.auth_user.entity.User;
import com.ecommerce.modules.auth_user.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class EcommerceBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(EcommerceBackendApplication.class, args);
    }

    @Bean
    public CommandLineRunner initDefaultUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String defaultHash = passwordEncoder.encode("123456");
            userRepository.findByUsernameIgnoreCase("admin").ifPresent(admin -> {
                admin.setPassword(defaultHash);
                userRepository.save(admin);
            });
            userRepository.findByUsernameIgnoreCase("customer").ifPresent(cust -> {
                cust.setPassword(defaultHash);
                userRepository.save(cust);
            });
            userRepository.findByUsernameIgnoreCase("hoangnam").ifPresent(hn -> {
                hn.setPassword(defaultHash);
                userRepository.save(hn);
            });
            System.out.println(">>> [SECURITY] Seed users (admin, customer, hoangnam) passwords initialized for '123456'");
        };
    }
}

