package com.example.railway.Controller;

import com.example.railway.Entity.User;
import com.example.railway.Service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @PostMapping("/register")
    public User register(@RequestBody Map<String, String> body) {
        try {
            return service.register(
                body.get("name"),
                body.get("email"),
                body.get("phone"),
                body.get("password")
            );
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @PostMapping("/login")
    public User login(@RequestBody Map<String, String> body) {
        try {
            return service.login(body.get("email"), body.get("password"));
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, e.getMessage());
        }
    }
}