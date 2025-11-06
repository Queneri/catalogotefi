import { useState } from "react";
import { ProductCard, Product } from "@/components/ProductCard";
import { CatalogHeader } from "@/components/CatalogHeader";
import { initialProducts } from "@/data/products";
import { exportToPDF } from "@/utils/pdfExport";
import { toast } from "sonner";

const Index = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const handlePriceUpdate = (id: number, newPrice: number) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, price: newPrice } : product
      )
    );
    toast.success("Precio actualizado correctamente");
  };

  const handleExportPDF = async () => {
    try {
      toast.info("Generando PDF...");
      await exportToPDF(products);
      toast.success("PDF exportado correctamente");
    } catch (error) {
      toast.error("Error al generar el PDF");
      console.error("Error exporting PDF:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <CatalogHeader onExportPDF={handleExportPDF} />
      
      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onPriceUpdate={handlePriceUpdate}
            />
          ))}
        </div>
      </main>

      <footer className="border-t border-border bg-background py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-light text-muted-foreground">
            © {new Date().getFullYear()} Anine Bing. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
