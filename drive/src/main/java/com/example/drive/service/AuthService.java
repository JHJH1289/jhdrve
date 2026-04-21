package com.example.drive.service;

import com.example.drive.dto.LoginRequest;
import com.example.drive.dto.LoginResponse;
import com.example.drive.dto.RegisterRequest;
import com.example.drive.dto.RegisterResponse;
import com.example.drive.entity.User;
import com.example.drive.repository.UserRepository;
import com.example.drive.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtTokenProvider jwtTokenProvider
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        String username = request.getUsername() == null ? "" : request.getUsername().trim();
        String password = request.getPassword() == null ? "" : request.getPassword().trim();

        if (username.isBlank()) {
            throw new IllegalArgumentException("아이디를 입력하세요.");
        }

        if (password.isBlank()) {
            throw new IllegalArgumentException("비밀번호를 입력하세요.");
        }

        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
        }

        User user = new User(username, passwordEncoder.encode(password));
        User saved = userRepository.save(user);

        return new RegisterResponse(saved.getId(), saved.getUsername());
    }

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        String token = jwtTokenProvider.createToken(authentication);
        return new LoginResponse(token, authentication.getName());
    }
}