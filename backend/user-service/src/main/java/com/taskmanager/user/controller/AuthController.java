package com.taskmanager.user.controller;

import com.taskmanager.user.dto.AuthResponse;
import com.taskmanager.user.dto.UserLoginRequest;
import com.taskmanager.user.dto.UserRegistrationRequest;
import com.taskmanager.user.dto.UserResponse;
import com.taskmanager.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> registerUser(@Valid @RequestBody UserRegistrationRequest request) {
        AuthResponse response = userService.registerUser(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> loginUser(@Valid @RequestBody UserLoginRequest request) {
        AuthResponse response = userService.authenticateUser(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateToken(@RequestHeader("Authorization") String authHeader) {
        Map<String, Object> response = new HashMap<>();

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.put("valid", false);
            response.put("message", "Invalid authorization header");
            return ResponseEntity.badRequest().body(response);
        }

        String token = authHeader.substring(7);
        boolean isValid = userService.validateToken(token);

        response.put("valid", isValid);

        if (isValid) {
            try {
                UserResponse user = userService.getUserFromToken(token);
                response.put("user", user);
            } catch (Exception e) {
                response.put("valid", false);
                response.put("message", "Token validation failed");
            }
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().build();
        }

        String token = authHeader.substring(7);
        UserResponse user = userService.getUserFromToken(token);
        return ResponseEntity.ok(user);
    }
}