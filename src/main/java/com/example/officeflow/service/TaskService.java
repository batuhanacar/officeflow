package com.example.officeflow.service;

import com.example.officeflow.dto.TaskCreateDTO;
import com.example.officeflow.dto.TaskViewDTO;
import com.example.officeflow.dto.UserViewDTO;
import com.example.officeflow.entity.Task;
import com.example.officeflow.entity.TaskStatus;
import com.example.officeflow.entity.User;
import com.example.officeflow.repository.TaskRepository;
import com.example.officeflow.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<TaskViewDTO> getAllTasks(Long userId) {
        List<Task> tasks;
        if (userId != null) {
            tasks = taskRepository.findByAssigneeId(userId);
        } else {
            tasks = taskRepository.findAll();
        }
        return tasks.stream()
                .map(this::convertToTaskViewDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public TaskViewDTO createTask(TaskCreateDTO taskCreateDTO) {
        User assignee = userRepository.findById(taskCreateDTO.getAssigneeId())
                .orElseThrow(() -> new EntityNotFoundException("Atanacak kullanıcı bulunamadı: " + taskCreateDTO.getAssigneeId()));

        Task task = Task.builder()
                .title(taskCreateDTO.getTitle())
                .description(taskCreateDTO.getDescription())
                .status(TaskStatus.TODO)
                .assignee(assignee)
                .build();

        Task savedTask = taskRepository.save(task);
        return convertToTaskViewDTO(savedTask);
    }

    @Transactional(readOnly = true)
    public TaskViewDTO getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Görev bulunamadı: " + id));
        return convertToTaskViewDTO(task);
    }

    @Transactional
    public TaskViewDTO updateTaskStatus(Long taskId, TaskStatus newStatus) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Güncellenecek görev bulunamadı: " + taskId));

        task.setStatus(newStatus);

        return convertToTaskViewDTO(task);
    }

    @Transactional
    public void deleteTask(Long taskId) {
        if (!taskRepository.existsById(taskId)) {
            throw new EntityNotFoundException("Silinecek görev bulunamadı: " + taskId);
        }
        taskRepository.deleteById(taskId);
    }

    @Transactional(readOnly = true)
    public boolean isTaskOwner(Long taskId, String username) {
        return taskRepository.findById(taskId)
                .map(task -> task.getAssignee().getUsername().equals(username))
                .orElse(false);
    }

    private TaskViewDTO convertToTaskViewDTO(Task task) {
        TaskViewDTO taskViewDTO = new TaskViewDTO();
        taskViewDTO.setId(task.getId());
        taskViewDTO.setTitle(task.getTitle());
        taskViewDTO.setDescription(task.getDescription());
        taskViewDTO.setStatus(task.getStatus());
        taskViewDTO.setCreatedDate(task.getCreatedDate());
        taskViewDTO.setDueDate(task.getDueDate());
        UserViewDTO userViewDTO = new UserViewDTO(task.getAssignee().getId(), task.getAssignee().getFullName());
        taskViewDTO.setAssignee(userViewDTO);
        return taskViewDTO;
    }
}