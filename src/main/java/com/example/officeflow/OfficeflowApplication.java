package com.example.officeflow;

import jakarta.annotation.PostConstruct; // YENİ IMPORT
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.util.TimeZone; // YENİ IMPORT

@SpringBootApplication
public class OfficeflowApplication {

	@PostConstruct
	public void init() {
		// Java uygulamasının varsayılan saat dilimini İstanbul olarak ayarla
		TimeZone.setDefault(TimeZone.getTimeZone("Europe/Istanbul"));
	}

	public static void main(String[] args) {
		SpringApplication.run(OfficeflowApplication.class, args);
	}

}