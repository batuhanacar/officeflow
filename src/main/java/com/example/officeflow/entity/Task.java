package com.example.officeflow.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    // @Lob ANNOTASYONUNU KALDIRDIK.
    // Bu annotasyon, Hibernate'in bu alanı standart bir metin olarak
    // işlemesini sağlayarak LOB hatasını önleyecektir.
    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdDate;

    private LocalDateTime dueDate;

    @ManyToOne
    @JoinColumn(name = "assignee_id", nullable = false)
    private User assignee;
}