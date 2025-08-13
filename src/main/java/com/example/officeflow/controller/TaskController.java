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
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final UserRepository userRepository;

    @GetMapping("/my-tasks")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TaskViewDTO>> getMyTasks(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Kullanıcı bulunamadı: " + authentication.getName()));
        return ResponseEntity.ok(taskService.getTasksByAssigneeId(user.getId()));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ROLE_TEAM_LEAD')")
    public ResponseEntity<List<TaskViewDTO>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_TEAM_LEAD')")
    public ResponseEntity<TaskViewDTO> createTask(@Valid @RequestBody TaskCreateDTO taskCreateDTO) {
        TaskViewDTO createdTask = taskService.createTask(taskCreateDTO);
        return new ResponseEntity<>(createdTask, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_USER') or hasAuthority('ROLE_TEAM_LEAD')")
    public ResponseEntity<TaskViewDTO> getTaskById(@PathVariable Long id) {
        TaskViewDTO task = taskService.getTaskById(id);
        return ResponseEntity.ok(task);
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
        long deletedCount = taskService.cleanupAllCompletedTasks();
        return ResponseEntity.ok(deletedCount + " adet tamamlanmış görev silindi.");
    }
}