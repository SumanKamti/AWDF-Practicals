import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportTasksToPDF(tasks, options = "all") {
  const doc = new jsPDF();

  const filterTab = typeof options === "string" ? options : options.filterTab || "all";
  const startDate = typeof options === "object" && options.startDate ? options.startDate : null;
  const endDate = typeof options === "object" && options.endDate ? options.endDate : null;

  let timelineText = "All Time";
  if (startDate && endDate) {
    timelineText = `${startDate} to ${endDate}`;
  } else if (startDate) {
    timelineText = `From ${startDate}`;
  } else if (endDate) {
    timelineText = `Up to ${endDate}`;
  }

  // Document Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(30, 64, 175); // Blue
  doc.text("Task Management System - Tasks Report", 14, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 26);
  doc.text(`Timeline: ${timelineText} | Status Filter: ${filterTab.toUpperCase()}`, 14, 32);

  // Statistics Summary Box
  const total = tasks.length;
  const completed = tasks.filter((t) => (t.status || "ongoing") === "complete").length;
  const ongoing = tasks.filter((t) => (t.status || "ongoing") === "ongoing").length;
  const incomplete = tasks.filter((t) => (t.status || "ongoing") === "incomplete").length;

  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 38, 182, 18, 2, 2, "FD");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(
    `Total Tasks: ${total}    |    Completed: ${completed}    |    Ongoing: ${ongoing}    |    Incomplete: ${incomplete}`,
    18,
    49
  );

  // Table Data Preparation
  const tableData = tasks.map((task) => [
    `#${task.id}`,
    task.title,
    (task.status || "ongoing").toUpperCase(),
    task.createdAt ? new Date(task.createdAt).toLocaleDateString() : "N/A",
    task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : "N/A",
  ]);

  autoTable(doc, {
    startY: 62,
    head: [["ID", "Task Title", "Status", "Created Date", "Updated Date"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 16, halign: "center" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 28, halign: "center" },
      3: { cellWidth: 28, halign: "center" },
      4: { cellWidth: 28, halign: "center" },
    },
    didParseCell: function (data) {
      if (data.section === "body" && data.column.index === 2) {
        const val = data.cell.raw;
        if (val === "COMPLETE") {
          data.cell.styles.textColor = [22, 101, 52]; // Green
          data.cell.styles.fontStyle = "bold";
        } else if (val === "ONGOING") {
          data.cell.styles.textColor = [30, 64, 175]; // Blue
          data.cell.styles.fontStyle = "bold";
        } else if (val === "INCOMPLETE") {
          data.cell.styles.textColor = [185, 28, 28]; // Red
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
    foot: [["", `Total Items: ${tasks.length}`, "", "", ""]],
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [71, 85, 105],
      fontStyle: "bold",
    },
  });

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Page ${i} of ${pageCount} — Advanced Web Development Frameworks Practical 7 (JWT Auth)`,
      14,
      doc.internal.pageSize.height - 10
    );
  }

  doc.save(`Tasks_Report_${filterTab}_${Date.now()}.pdf`);
}
