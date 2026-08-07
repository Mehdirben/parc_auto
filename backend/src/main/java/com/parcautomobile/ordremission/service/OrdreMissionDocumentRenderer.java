package com.parcautomobile.ordremission.service;

import static com.parcautomobile.ordremission.api.OrdreMissionDtos.OrdreMissionResponse;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;

import com.openhtmltopdf.bidi.support.ICUBidiReorderer;
import com.openhtmltopdf.bidi.support.ICUBidiSplitter;
import com.openhtmltopdf.outputdevice.helper.BaseRendererBuilder.TextDirection;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import org.springframework.stereotype.Component;
import org.springframework.web.util.HtmlUtils;

@Component
public class OrdreMissionDocumentRenderer {
    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final String FONT_RESOURCE = "/fonts/NotoSansArabic-Regular.ttf";

    public byte[] render(OrdreMissionResponse ordre) {
        String html = html(ordre);
        try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.useUnicodeBidiSplitter(new ICUBidiSplitter.ICUBidiSplitterFactory());
            builder.useUnicodeBidiReorderer(new ICUBidiReorderer());
            builder.defaultTextDirection(TextDirection.LTR);
            builder.useFont(this::ouvrirPolice, "Noto Sans Arabic");
            builder.withHtmlContent(html, null);
            builder.toStream(output);
            builder.run();
            return output.toByteArray();
        } catch (IOException exception) {
            throw new IllegalStateException("Impossible de générer l’ordre de mission en PDF.", exception);
        }
    }

    private String html(OrdreMissionResponse ordre) {
        String html = """
                <!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8" />
                <title>%s</title><style>
                @page{size:A4;margin:18mm}body{font-family:'Noto Sans Arabic',sans-serif;color:#172521}
                .sheet{max-width:780px;margin:auto;border:2px solid #24415f;padding:26px 34px}
                .numero{font-size:12px;color:#4c6d8d}.title{text-align:center;color:#0874c9;
                font-size:26px;text-decoration:underline;margin:30px 0}
                table{width:100%%;border-collapse:collapse}th,td{padding:13px 10px;
                border-bottom:1px solid #d8e1e8;font-size:15px}th{width:38%%;text-align:right;
                direction:rtl;font-weight:700}td{font-weight:700}.footer{margin-top:40px;
                text-align:right;direction:rtl}.signature{margin:45px 0;text-align:center;
                direction:rtl;font-weight:700}.meta{font-size:11px;color:#4c6d8d}
                </style></head><body><main class="sheet">
                <p class="numero">N° %s</p><h1 class="title" dir="rtl">تكليف بمهمة</h1>
                <table>
                <tr><th>السيد — Conducteur</th><td>%s</td></tr>
                <tr><th>المهمة — Fonction</th><td>سائق — Conducteur</td></tr>
                <tr><th>نوع المأمورية — Type de mission</th><td>%s</td></tr>
                <tr><th>الموضوع — Motif</th><td>%s</td></tr>
                <tr><th>تاريخ الذهاب — Date d'aller</th><td>%s</td></tr>
                <tr><th>تاريخ الإياب — Date de retour</th><td>%s</td></tr>
                <tr><th>وسيلة النقل — Véhicule</th><td>%s</td></tr>
                </table>
                <p class="footer">الرباط في : %s</p>
                <p class="signature">عن وزير التعليم العالي والبحث العلمي والابتكار وبتفويض منه</p>
                <p class="meta">Véhicule : %s | Service : %s</p>
                </main></body></html>
                """.formatted(
                e(ordre.numero()), e(ordre.numero()), e(ordre.conducteur()),
                e(ordre.typeMission()), e(ordre.motif()), ordre.dateAller().format(DATE),
                ordre.dateRetour().format(DATE), e(ordre.vehicule()),
                ordre.dateEdition().format(DATE), e(ordre.vehicule()), e(ordre.serviceParc()));
        return html;
    }

    private InputStream ouvrirPolice() {
        InputStream police = getClass().getResourceAsStream(FONT_RESOURCE);
        if (police == null) {
            throw new IllegalStateException("Police PDF introuvable : " + FONT_RESOURCE);
        }
        return police;
    }

    private String e(String valeur) {
        return HtmlUtils.htmlEscape(
                valeur == null ? "" : valeur, StandardCharsets.UTF_8.name());
    }
}
