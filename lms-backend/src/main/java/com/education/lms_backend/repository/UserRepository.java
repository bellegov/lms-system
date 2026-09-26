package com.education.lms_backend.repository;


import com.education.lms_backend.model.Role;
import com.education.lms_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    long countByRole(Role role);
}