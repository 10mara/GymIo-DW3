import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function gerarRelatorioPDF(dados) {
  const doc = new jsPDF("p", "mm", "a4");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("GymIO", 14, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Sistema de Gestão", 14, 24);

  doc.setDrawColor(226, 232, 240);
  doc.line(14, 30, 196, 30);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(dados.titulo, 14, 42);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Período: ${dados.periodo}`, 14, 49);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Resumo Geral", 14, 62);

  let x = 14;

  dados.resumo.forEach((item) => {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, 68, 55, 24, 3, 3, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(String(item.label ?? ""), x + 5, 77);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(String(item.valor ?? ""), x + 5, 86);

    x += 61;
  });

  autoTable(doc, {
    startY: 105,
    head: [dados.colunas],
    body: dados.tabela,
    theme: "grid",
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
  });

  const nomeArquivo = `${dados.titulo.replaceAll(" ", "_")}.pdf`;
  doc.save(nomeArquivo);
}
