package com.example.officeflow.controller;

import com.example.officeflow.dto.TaskCreateDTO;
import com.example.officeflow.dto.TaskViewDTO;
import com.example.officeflow.entity.TaskStatus;
import com.example.officeflow.entity.User;
import com.example.officeflow.repository.UserRepository;
import com.example.officeflow.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.Map;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import java.io.IOException;
import com.example.officeflow.service.ReportService;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final ReportService reportService;
    private final TaskService taskService;
    private final UserRepository userRepository;

    @GetMapping("/my-tasks")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TaskViewDTO>> getMyTasks(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow(() -> new UsernameNotFoundException("Kullanıcı bulunamadı"));
        return ResponseEntity.ok(taskService.getTasksByAssigneeId(user.getId()));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ROLE_TEAM_LEAD')")
    public ResponseEntity<List<TaskViewDTO>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TaskViewDTO> createTask(@Valid @RequestBody TaskCreateDTO taskCreateDTO, Authentication authentication) {
        // KULLANICI ROLÜNE GÖRE KISITLAMA YAPAN 'if' BLOĞUNU TAMAMEN SİLDİK.
        // Artık tüm giriş yapmış kullanıcılar, istediği kişilere görev atayabilir.

        TaskViewDTO createdTask = taskService.createTask(taskCreateDTO);
        return new ResponseEntity<>(createdTask, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TaskViewDTO> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ROLE_TEAM_LEAD') or @taskService.isTaskOwner(#id, authentication.name)")
    public ResponseEntity<TaskViewDTO> updateTaskStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        TaskStatus newStatus = TaskStatus.valueOf(body.get("status").toUpperCase());
        TaskViewDTO updatedTask = taskService.updateTaskStatus(id, newStatus);
        return ResponseEntity.ok(updatedTask);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_TEAM_LEAD')")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/cleanup-completed")
    @PreAuthorize("hasAuthority('ROLE_TEAM_LEAD')")
    public ResponseEntity<String> cleanupCompletedTasks() {
        return ResponseEntity.ok(taskService.cleanupAllCompletedTasks() + " adet tamamlanmış görev silindi.");
    }

    @GetMapping("/export/excel")
    @PreAuthorize("hasAuthority('ROLE_TEAM_LEAD')")
    public ResponseEntity<InputStreamResource> exportTasksToExcel() throws IOException {
        List<TaskViewDTO> tasks = taskService.getAllTasks();
        ByteArrayInputStream in = reportService.generateExcelReport(tasks);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=gorevler.xlsx");
        headers.add("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        return ResponseEntity.ok().headers(headers).body(new InputStreamResource(in));
    }

    @GetMapping("/export/pdf")
    @PreAuthorize("hasAuthority('ROLE_TEAM_LEAD')")
    public ResponseEntity<InputStreamResource> exportTasksToPdf() {
        List<TaskViewDTO> tasks = taskService.getAllTasks();
        ByteArrayInputStream bis = reportService.generatePdfReport(tasks);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=gorevler.pdf");
        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }
}