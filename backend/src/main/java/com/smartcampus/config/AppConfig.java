package com.smartcampus.config;

import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * ================================================================
 * AppConfig - General Application Bean Configuration
 * ================================================================
 * Owner: Member 1 (Team Lead)
 *
 * Place general-purpose Spring beans here.
 * Do NOT add security beans here — use SecurityConfig.java
 *
 * TODO: All Members - Add any shared utility beans here
 * ================================================================
 */
@Configuration
public class AppConfig {

    /**
     * ModelMapper bean for easy Entity ↔ DTO mapping.
     * Usage: modelMapper.map(entity, ResponseDTO.class)
     */
    @Bean
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }
}
