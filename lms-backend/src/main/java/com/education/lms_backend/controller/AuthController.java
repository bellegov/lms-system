package com.education.lms_backend.controller;

import com.education.lms_backend.dto.AuthRequest;
import com.education.lms_backend.dto.AuthResponse;
import com.education.lms_backend.model.Role;
import com.education.lms_backend.model.User;
import com.education.lms_backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest req) {
        try {
            User user = authService.register(req.getUsername(), req.getPassword(), req.getFullName(), Role.STUDENT);
            return ResponseEntity.ok(new AuthResponse(user.getId(), user.getUsername(), user.getRole().name(), user.getFullName()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest req) {
        try {
            User user = authService.login(req.getUsername(), req.getPassword());
            return ResponseEntity.ok(new AuthResponse(user.getId(), user.getUsername(), user.getRole().name(), user.getFullName()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }
}
