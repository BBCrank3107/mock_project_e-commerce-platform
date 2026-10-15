package com.ecommerce.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        File uploadFolder = uploadPath.toFile();
        if (!uploadFolder.exists()) {
            File backendFolder = new File("backend", uploadDir);
            if (backendFolder.exists()) {
                uploadPath = backendFolder.toPath().toAbsolutePath().normalize();
            } else {
                uploadFolder.mkdirs();
            }
        }

        String locationUri = uploadPath.toUri().toString();
        if (!locationUri.endsWith("/")) {
            locationUri += "/";
        }

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(locationUri, "file:uploads/", "file:backend/uploads/")
                .setCachePeriod(3600);
    }
}
