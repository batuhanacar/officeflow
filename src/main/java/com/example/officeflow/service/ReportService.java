package com.example.officeflow.service;

import com.example.officeflow.dto.TaskViewDTO;
import com.example.officeflow.entity.TaskStatus;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.itextpdf.html2pdf.HtmlConverter;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final TemplateEngine templateEngine;

    public ByteArrayInputStream generateExcelReport(List<TaskViewDTO> tasks) throws IOException {
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            XSSFSheet sheet = workbook.createSheet("Görevler");

            // 1. BAŞLIKLARI GÜNCELLE (ID olmadan)
            String[] headers = {"Başlık", "Atanan Kişi(ler)", "Oluşturulma Tarihi", "Son Teslim Tarihi", "Durum"};
            Row headerRow = sheet.createRow(0);
            for (int col = 0; col < headers.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(headers[col]);
            }

            // 2. TARİH FORMATINI BELİRLE
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");

            // 3. DURUM ÇEVİRİLERİNİ TANIMLA
            Map<TaskStatus, String> statusTranslations = Map.of(
                    TaskStatus.TODO, "Yapılacak",
                    TaskStatus.IN_PROGRESS, "Devam Ediyor",
                    TaskStatus.DONE, "Tamamlandı"
            );

            int rowIdx = 1;
            for (TaskViewDTO task : tasks) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(task.getTitle());

                String assignees = task.getAssignees().stream()
                        .map(u -> u.getFullName())
                        .collect(Collectors.joining(", "));
                row.createCell(1).setCellValue(assignees);

                // Tarihleri formatla
                row.createCell(2).setCellValue(task.getCreatedDate() != null ? task.getCreatedDate().format(formatter) : "");
                row.createCell(3).setCellValue(task.getDueDate() != null ? task.getDueDate().format(formatter) : "");

                // Durumu Türkçeye çevir
                row.createCell(4).setCellValue(statusTranslations.getOrDefault(task.getStatus(), task.getStatus().toString()));
            }

            // Sütunları otomatik genişlet
            for(int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    public ByteArrayInputStream generatePdfReport(List<TaskViewDTO> tasks) {
        Context context = new Context();
        context.setVariable("tasks", tasks);
        context.setVariable("reportDate", LocalDate.now().format(DateTimeFormatter.ofPattern("dd.MM.yyyy")));

        Map<TaskStatus, String> statusTranslations = Map.of(
                TaskStatus.TODO, "Yapılacak",
                TaskStatus.IN_PROGRESS, "Devam Ediyor",
                TaskStatus.DONE, "Tamamlandı"
        );
        context.setVariable("statusTranslations", statusTranslations);

        String processedHtml = templateEngine.process("report-template", context);

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        HtmlConverter.convertToPdf(processedHtml, out);

        return new ByteArrayInputStream(out.toByteArray());
    }
}