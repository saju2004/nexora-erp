package com.erp.nexora;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class NexoraErpApplication {

    public static void main(String[] args) {
        SpringApplication.run(NexoraErpApplication.class, args);
    }
}
