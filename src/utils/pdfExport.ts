import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Product } from "@/components/ProductCard";

export const exportToPDF = async (products: Product[]) => {
  try {
    // Find the products grid container
    const productGrid = document.querySelector('.product-grid-container');
    
    if (!productGrid) {
      console.error('No se encontró el contenedor del catálogo');
      return;
    }

    // Create a temporary container with white background for better PDF rendering
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.background = 'white';
    tempContainer.style.padding = '40px';
    tempContainer.style.width = '1200px';
    
    // Clone the content
    const header = document.createElement('div');
    header.style.textAlign = 'center';
    header.style.marginBottom = '40px';
    header.innerHTML = `
      <h1 style="font-size: 32px; font-weight: 600; color: #000; margin-bottom: 8px;">ANINE BING</h1>
      <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 3px; color: #666;">Catálogo de Productos</p>
    `;
    
    tempContainer.appendChild(header);
    
    const clonedGrid = productGrid.cloneNode(true) as HTMLElement;
    clonedGrid.style.display = 'grid';
    clonedGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
    clonedGrid.style.gap = '24px';
    
    tempContainer.appendChild(clonedGrid);
    document.body.appendChild(tempContainer);

    // Capture the element as canvas
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    // Remove temp container
    document.body.removeChild(tempContainer);

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    const imgWidth = pageWidth - 20; // 10mm margin on each side
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 10;

    // Add first page
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= (pageHeight - 20);

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - 20);
    }

    // Add footer to all pages
    const date = new Date().toLocaleDateString("es-ES");
    const totalPages = pdf.getNumberOfPages();
    
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Generado el ${date}`, pageWidth / 2, pageHeight - 5, {
        align: "center",
      });
    }

    pdf.save("anine-bing-catalogo.pdf");
  } catch (error) {
    console.error('Error al generar PDF:', error);
  }
};
