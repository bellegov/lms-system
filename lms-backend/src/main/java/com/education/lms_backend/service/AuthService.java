package com.education.lms_backend.service;

import com.education.lms_backend.model.Role;
import com.education.lms_backend.model.User;
import com.education.lms_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepo;

    public User register(String username, String password, String fullName, Role role) {
        if (userRepo.findByUsername(username).isPresent()) {
            throw new RuntimeException("Этот логин уже занят!");
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(password);
        user.setFullName(fullName);
        user.setRole(role);

        return userRepo.save(user);
    }

    public User login(String username, String password) {
        return userRepo.findByUsername(username)
                .filter(u -> u.getPassword().equals(password))
                .orElseThrow(() -> new RuntimeException("Неверный логин или пароль"));
    }
}
