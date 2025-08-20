package com.example.officeflow.service;

import com.example.officeflow.dto.CommentDTO;
import com.example.officeflow.entity.Comment;
import com.example.officeflow.entity.Task;
import com.example.officeflow.entity.User;
import com.example.officeflow.repository.CommentRepository;
import com.example.officeflow.repository.TaskRepository;
import com.example.officeflow.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<CommentDTO> getCommentsForTask(Long taskId) {
        return commentRepository.findByTaskIdOrderByCreatedAtDesc(taskId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentDTO createComment(Long taskId, String content, String username) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Yorum yapılacak görev bulunamadı: " + taskId));

        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Kullanıcı bulunamadı"));

        Comment comment = Comment.builder()
                .content(content)
                .task(task)
                .author(author)
                .build();

        Comment savedComment = commentRepository.save(comment);
        return convertToDto(savedComment);
    }

    private CommentDTO convertToDto(Comment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setAuthorFullName(comment.getAuthor().getFullName());
        return dto;
    }
}