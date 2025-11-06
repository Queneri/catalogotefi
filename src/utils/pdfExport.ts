import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Product } from "@/components/ProductCard";

const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

export const exportToPDF = async (products: Product[]) => {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const imageWidth = 50;
  const imageHeight = 65;

  // Header
  pdf.setFontSize(24);
  pdf.setFont("helvetica", "bold");
  pdf.text("ANINE BING", pageWidth / 2, 20, { align: "center" });
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text("CATÁLOGO DE PRODUCTOS", pageWidth / 2, 28, { align: "center" });

  let yPosition = 40;
  const lineHeight = 8;
  const sectionGap = 15;

  for (const product of products) {
    // Check if we need a new page
    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      yPosition = 20;
    }

    try {
      // Add first product image
      const img = await loadImage(product.images[0]);
      pdf.addImage(img, "JPEG", margin, yPosition, imageWidth, imageHeight);
    } catch (error) {
      console.error("Error loading image:", error);
    }

    // Position text next to image
    const textX = margin + imageWidth + 10;
    let textY = yPosition + 5;

    // Product name
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text(product.name, textX, textY);
    textY += lineHeight;

    // Category
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(100, 100, 100);
    pdf.text(product.category.toUpperCase(), textX, textY);
    textY += lineHeight;

    // Sizes
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Talles: ${product.sizes.join(", ")}`, textX, textY);
    textY += lineHeight;

    // Price
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.text(`$${product.price.toFixed(2)}`, textX, textY);

    yPosition += imageHeight + sectionGap;

    // Separator line
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += sectionGap;
  }

  // Footer
  const date = new Date().toLocaleDateString("es-ES");
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(150, 150, 150);
  pdf.text(`Generado el ${date}`, pageWidth / 2, pageHeight - 10, {
    align: "center",
  });

  pdf.save("anine-bing-catalogo.pdf");
};
