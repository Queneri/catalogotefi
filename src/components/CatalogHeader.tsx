import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface CatalogHeaderProps {
  onExportPDF: () => void;
}

export const CatalogHeader = ({ onExportPDF }: CatalogHeaderProps) => {
  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground">
              ANINE BING
            </h1>
            <p className="mt-1 text-sm font-light uppercase tracking-widest text-muted-foreground">
              Catálogo de Productos
            </p>
          </div>
          <Button
            onClick={onExportPDF}
            variant="outline"
            className="border-foreground text-foreground hover:bg-foreground hover:text-background"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar a PDF
          </Button>
        </div>
      </div>
    </header>
  );
};
