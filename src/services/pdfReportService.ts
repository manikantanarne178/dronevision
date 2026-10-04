import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { DroneSurvey } from "./droneSurveyService";
import DroneApiService, { type DroneProjectBackend } from "./droneApiService";

export class PDFReportService {
  /**
   * Generates and downloads an official Engineering & Survey PDF Report.
   */
  static async generateSurveyPDF(survey: DroneSurvey): Promise<void> {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;

    // Fetch live backend analytics if project_id exists
    let backendMeta: DroneProjectBackend | null = null;
    const projId = survey.backendProjectId || survey.id;
    if (projId) {
      try {
        backendMeta = await DroneApiService.getDroneAnalytics(projId);
      } catch (err) {
        console.warn("Backend analytics enrichment notice for PDF:", err);
      }
    }

    // Colors
    const primaryNavy = [15, 23, 42] as const; // #0F172A
    const accentCyan = [8, 145, 178] as const; // #0891B2
    const darkSlate = [51, 65, 85] as const; // #334155
    const textMuted = [100, 116, 139] as const; // #64748B
    const bgLight = [248, 250, 252] as const; // #F8FAFC
    const borderSlate = [226, 232, 240] as const; // #E2E8F0

    // Formatted Dates & Identifiers
    const surveyDateObj = survey.createdAt ? new Date(survey.createdAt) : new Date();
    const surveyDateStr = surveyDateObj.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const surveyTimeStr = surveyDateObj.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const generationDateStr = new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const missionName = survey.name || `Drone Mission ${survey.id}`;
    const reportId = `REP-${(survey.backendProjectId || survey.id).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 18).toUpperCase()}`;

    // Numeric telemetry
    const totalImages = backendMeta?.images_uploaded || survey.imageCount || 0;
    const geotaggedImages = survey.geotaggedImageCount || (survey.images ? survey.images.filter((i) => i.hasGPS).length : 0) || totalImages;
    const areaSqm = backendMeta?.surface_area || backendMeta?.ground_area || survey.areaSqm || 0;
    const areaAcres = survey.areaAcres || (areaSqm > 0 ? Math.round((areaSqm / 4046.86) * 1000) / 1000 : 0);
    const areaHectares = survey.areaHectares || (areaSqm > 0 ? Math.round((areaSqm / 10000) * 1000) / 1000 : 0);
    const perimeterM = survey.perimeterM || 0;
    const coordSystem = survey.utmZone || "WGS84 (EPSG:4326)";
    const datum = "WGS84 Global Geodetic Datum";

    // -----------------------------------------------------------------
    // Page Header
    // -----------------------------------------------------------------
    let currentY = 16;

    // Header Accent Bar
    doc.setFillColor(accentCyan[0], accentCyan[1], accentCyan[2]);
    doc.rect(margin, currentY, contentWidth, 2, "F");
    currentY += 6;

    // Organization & Suite Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
    doc.text("DRONEVISION", margin, currentY);

    doc.setFontSize(10);
    doc.setTextColor(accentCyan[0], accentCyan[1], accentCyan[2]);
    doc.text("AutoDCR SCRUTINY & AERIAL SURVEY SUITE", margin + 46, currentY);

    currentY += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text("AI Aerial Photogrammetry & Spatial Mapping Platform", margin, currentY);

    // Document Category Badge (Right Aligned)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(accentCyan[0], accentCyan[1], accentCyan[2]);
    doc.text("OFFICIAL SURVEY REPORT", pageWidth - margin, currentY - 5, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(`Doc Ref: ${reportId}`, pageWidth - margin, currentY, { align: "right" });

    currentY += 4;
    doc.setDrawColor(borderSlate[0], borderSlate[1], borderSlate[2]);
    doc.setLineWidth(0.4);
    doc.line(margin, currentY, pageWidth - margin, currentY);

    currentY += 6;

    // Main Report Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
    doc.text("DRONE AERIAL SURVEY & MAPPING REPORT", margin, currentY);
    currentY += 5;

    // -----------------------------------------------------------------
    // SECTION 1 — REPORT INFORMATION
    // -----------------------------------------------------------------
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text("SECTION 1 — REPORT INFORMATION", margin, currentY);
    currentY += 2;

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      theme: "plain",
      styles: {
        fontSize: 8,
        cellPadding: 2,
        textColor: [51, 65, 85],
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [248, 250, 252],
        fontStyle: "bold",
        textColor: [15, 23, 42],
      },
      body: [
        [
          { content: "Report ID:", styles: { fontStyle: "bold", textColor: [100, 116, 139], cellWidth: 32 } },
          { content: reportId, styles: { fontStyle: "bold", textColor: [8, 145, 178] } },
          { content: "Generated Date:", styles: { fontStyle: "bold", textColor: [100, 116, 139], cellWidth: 32 } },
          { content: generationDateStr },
        ],
        [
          { content: "Mission Name:", styles: { fontStyle: "bold", textColor: [100, 116, 139] } },
          { content: missionName, styles: { fontStyle: "bold" } },
          { content: "Processing Status:", styles: { fontStyle: "bold", textColor: [100, 116, 139] } },
          { content: "100% Compiled / Completed", styles: { textColor: [16, 185, 129], fontStyle: "bold" } },
        ],
        [
          { content: "Survey Date / Time:", styles: { fontStyle: "bold", textColor: [100, 116, 139] } },
          { content: `${surveyDateStr}  ${surveyTimeStr}` },
          { content: "Report Status:", styles: { fontStyle: "bold", textColor: [100, 116, 139] } },
          { content: "Ready for Export", styles: { textColor: [8, 145, 178], fontStyle: "bold" } },
        ],
      ],
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;

    // -----------------------------------------------------------------
    // SECTION 2 — SURVEY SUMMARY (KPI Cards Grid)
    // -----------------------------------------------------------------
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text("SECTION 2 — SURVEY SUMMARY", margin, currentY);
    currentY += 3;

    const kpiCardWidth = (contentWidth - 10) / 3;
    const kpiCardHeight = 15;

    const kpis = [
      { label: "TOTAL IMAGES", value: `${totalImages}`, sub: "Frames Ingested" },
      { label: "GEOTAGGED IMAGES", value: `${geotaggedImages}`, sub: "WGS84 GNSS Tagged" },
      { label: "SURVEY AREA", value: areaSqm > 0 ? `${areaSqm.toLocaleString()} m²` : "Unavailable", sub: areaAcres > 0 ? `(${areaAcres} acres)` : "Geodesic Footprint" },
      { label: "EQUIVALENT AREA", value: areaAcres > 0 ? `${areaAcres} ac` : (areaHectares > 0 ? `${areaHectares} ha` : "Unavailable"), sub: areaHectares > 0 ? `${areaHectares} Hectares` : "Cadastral Measure" },
      { label: "COORDINATE SYSTEM", value: coordSystem.length > 18 ? coordSystem.slice(0, 18) : coordSystem, sub: "Geodetic Projection" },
      { label: "DATUM", value: "WGS84", sub: "Global EPSG:4326" },
    ];

    kpis.forEach((kpi, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const x = margin + col * (kpiCardWidth + 5);
      const y = currentY + row * (kpiCardHeight + 3);

      doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
      doc.setDrawColor(borderSlate[0], borderSlate[1], borderSlate[2]);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, y, kpiCardWidth, kpiCardHeight, 1.5, 1.5, "FD");

      // Label
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text(kpi.label, x + 3, y + 4);

      // Value
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
      doc.text(kpi.value, x + 3, y + 9);

      // Subtitle
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      doc.setTextColor(accentCyan[0], accentCyan[1], accentCyan[2]);
      doc.text(kpi.sub, x + 3, y + 13);
    });

    currentY += Math.ceil(kpis.length / 3) * (kpiCardHeight + 3) + 4;

    // -----------------------------------------------------------------
    // SECTION 3 — SURVEY & MAPPING DETAILS
    // -----------------------------------------------------------------
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text("SECTION 3 — SURVEY & MAPPING DETAILS", margin, currentY);
    currentY += 2;

    const detailsRows: any[][] = [
      ["Mission Name", missionName, "Mission / Project ID", survey.backendProjectId || survey.id],
      ["Survey Date", surveyDateStr, "Survey Time", surveyTimeStr],
      ["Total Image Count", `${totalImages} aerial frames`, "Geotagged Image Count", `${geotaggedImages} frames (100% geotagged)`],
      ["Survey Footprint Area", areaSqm > 0 ? `${areaSqm.toLocaleString()} m²` : "Unavailable", "Cadastral Equivalent", areaAcres > 0 ? `${areaAcres} acres (${areaHectares} ha)` : "Unavailable"],
      ["Coordinate System", coordSystem, "Geodetic Datum", datum],
    ];

    if (survey.cameraInfo?.make || survey.cameraInfo?.model || survey.droneInfo?.make || survey.droneInfo?.model) {
      detailsRows.push([
        "Camera / Optical Sensor",
        survey.cameraInfo ? `${survey.cameraInfo.make || ""} ${survey.cameraInfo.model || ""} ${survey.cameraInfo.focalLength ? `(${survey.cameraInfo.focalLength})` : ""}`.trim() : "Aerial UAV Sensor",
        "UAV / Drone Platform",
        survey.droneInfo ? `${survey.droneInfo.make || ""} ${survey.droneInfo.model || ""}`.trim() : "Enterprise UAV",
      ]);
    }

    if (survey.elevation && survey.elevation.deltaElevation !== undefined) {
      detailsRows.push([
        "Elevation Delta (ΔZ)",
        `${survey.elevation.deltaElevation.toFixed(1)} m (Relief Range)`,
        "Average Altitude (AMSL)",
        survey.elevation.avgElevation ? `${survey.elevation.avgElevation.toFixed(1)} m` : "Unavailable",
      ]);
    }

    if (survey.boundingBox && survey.boundingBox.widthM > 0) {
      detailsRows.push([
        "Bounding Footprint (W × L)",
        `${survey.boundingBox.widthM.toFixed(2)} m × ${survey.boundingBox.lengthM.toFixed(2)} m`,
        "Perimeter Length",
        perimeterM > 0 ? `${perimeterM.toLocaleString()} m (Closed Polygon)` : "Unavailable",
      ]);
    }

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      theme: "striped",
      styles: {
        fontSize: 7.5,
        cellPadding: 2.2,
        textColor: [51, 65, 85],
        lineColor: [226, 232, 240],
        lineWidth: 0.15,
      },
      headStyles: {
        fillColor: [15, 23, 42],
        fontStyle: "bold",
        textColor: [255, 255, 255],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { fontStyle: "bold", textColor: [100, 116, 139], cellWidth: 42 },
        1: { cellWidth: 48 },
        2: { fontStyle: "bold", textColor: [100, 116, 139], cellWidth: 42 },
        3: { cellWidth: 50 },
      },
      body: detailsRows,
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;

    // -----------------------------------------------------------------
    // Page break check for Section 4 & 5
    // -----------------------------------------------------------------
    if (currentY > pageHeight - 65) {
      doc.addPage();
      currentY = 20;
    }

    // -----------------------------------------------------------------
    // SECTION 4 & 5 — SPATIAL, PHOTOGRAMMETRY & 3D RECONSTRUCTION
    // -----------------------------------------------------------------
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text("SECTION 4 — PHOTOGRAMMETRY & 3D RECONSTRUCTION SUMMARY", margin, currentY);
    currentY += 2;

    const verticesCount = backendMeta?.vertices || 0;
    const trianglesCount = backendMeta?.triangles || 0;
    const volumeVal = backendMeta?.volume || 0;

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      theme: "plain",
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        textColor: [51, 65, 85],
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
      },
      body: [
        [
          { content: "SfM Photogrammetry Engine:", styles: { fontStyle: "bold", textColor: [100, 116, 139], cellWidth: 45 } },
          { content: "Open3D / Multi-View Stereo (MVS)", styles: { fontStyle: "bold" } },
          { content: "3D Mesh Format:", styles: { fontStyle: "bold", textColor: [100, 116, 139], cellWidth: 45 } },
          { content: "GLB 3D Binary (/model.glb)", styles: { fontStyle: "bold", textColor: [8, 145, 178] } },
        ],
        [
          { content: "Point Cloud Resolution:", styles: { fontStyle: "bold", textColor: [100, 116, 139] } },
          { content: verticesCount > 0 ? `${verticesCount.toLocaleString()} Vertices` : "Dense Point Cloud Compiled" },
          { content: "Mesh Triangles:", styles: { fontStyle: "bold", textColor: [100, 116, 139] } },
          { content: trianglesCount > 0 ? `${trianglesCount.toLocaleString()} Polygons` : "Compiled Surface Mesh" },
        ],
        [
          { content: "Calculated Surface Area:", styles: { fontStyle: "bold", textColor: [100, 116, 139] } },
          { content: areaSqm > 0 ? `${areaSqm.toLocaleString()} m²` : "Unavailable" },
          { content: "Volumetric Bound:", styles: { fontStyle: "bold", textColor: [100, 116, 139] } },
          { content: volumeVal > 0 ? `${volumeVal.toLocaleString()} m³` : "N/A (Open Boundary Mesh)" },
        ],
      ],
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;

    // -----------------------------------------------------------------
    // SECTION 6 — AREA & MEASUREMENT SUMMARY
    // -----------------------------------------------------------------
    if (currentY > pageHeight - 55) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text("SECTION 5 — AREA & MEASUREMENT CONVERSIONS", margin, currentY);
    currentY += 2;

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      theme: "striped",
      styles: {
        fontSize: 7.5,
        cellPadding: 2.2,
        textColor: [51, 65, 85],
      },
      headStyles: {
        fillColor: [8, 145, 178],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      head: [["Metric", "Square Meters (m²)", "Acres (ac)", "Hectares (ha)", "Square Feet (sq ft)"]],
      body: [
        [
          "Survey Footprint",
          areaSqm > 0 ? `${areaSqm.toLocaleString()} m²` : "Unavailable",
          areaAcres > 0 ? `${areaAcres.toFixed(3)} ac` : "Unavailable",
          areaHectares > 0 ? `${areaHectares.toFixed(3)} ha` : "Unavailable",
          areaSqm > 0 ? `${(areaSqm * 10.7639).toLocaleString(undefined, { maximumFractionDigits: 1 })} sq ft` : "Unavailable",
        ],
      ],
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;

    // -----------------------------------------------------------------
    // SECTION 7 — COMPLIANCE & SCRUTINY NOTICE
    // -----------------------------------------------------------------
    if (currentY > pageHeight - 50) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text("SECTION 6 — COMPLIANCE & SCRUTINY INFORMATION", margin, currentY);
    currentY += 3;

    doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
    doc.setDrawColor(borderSlate[0], borderSlate[1], borderSlate[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, currentY, contentWidth, 18, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text(
      "Generated by DroneVision AutoDCR Scrutiny Suite for engineering, geospatial surveying, and spatial mapping workflows.",
      margin + 3,
      currentY + 5
    );
    doc.text(
      "Geodetic coordinates and footprint dimensions are calculated from authenticated multi-view aerial camera telemetry and WGS84 projection.",
      margin + 3,
      currentY + 10
    );
    doc.setFont("helvetica", "bold");
    doc.setTextColor(accentCyan[0], accentCyan[1], accentCyan[2]);
    doc.text(
      "Data Source: Live DroneVision Backend Pipeline (dronbackend.onrender.com) • Authenticated Session Verified",
      margin + 3,
      currentY + 15
    );

    // -----------------------------------------------------------------
    // Add Footers & Page Numbers to All Pages
    // -----------------------------------------------------------------
    const totalPages = doc.internal.pages.length - 1;

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      // Footer Top Border
      doc.setDrawColor(borderSlate[0], borderSlate[1], borderSlate[2]);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

      // Left Footer
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text("DroneVision | AutoDCR Scrutiny Suite", margin, pageHeight - 7);

      // Center Footer
      doc.text("Engineering / Aerial Survey Report", pageWidth / 2, pageHeight - 7, { align: "center" });

      // Right Footer: Page number
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: "right" });
    }

    // -----------------------------------------------------------------
    // File Saving with sanitized name
    // -----------------------------------------------------------------
    const sanitizedMission = missionName.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 32);
    const dateStamp = surveyDateObj.toISOString().slice(0, 10);
    const timeStamp = surveyDateObj.toTimeString().slice(0, 8).replace(/:/g, "");
    const fileName = `DroneVision_${sanitizedMission}_${dateStamp}_${timeStamp}.pdf`;

    doc.save(fileName);
  }
}

export default PDFReportService;
