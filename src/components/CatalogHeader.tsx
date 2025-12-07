import { Button } from "@/components/ui/button";
import { Download, LogOut, LogIn } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface CatalogHeaderProps {
  onExportPDF: () => void;
  isAdmin: boolean;
  user: User | null;
  onLogout: () => void;
  onLogin: () => void;
  brandName?: string;
}

export const CatalogHeader = ({ 
  onExportPDF, 
  isAdmin, 
  user,
  onLogout,
  onLogin,
  brandName
}: CatalogHeaderProps) => {
  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground">
              {brandName || "ANINE BING & GOLDEN GOOSE"}
            </h1>
            <p className="mt-1 text-sm font-light uppercase tracking-widest text-muted-foreground">
              Catálogo de Productos
            </p>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Button
                onClick={onExportPDF}
                variant="outline"
                className="border-foreground text-foreground hover:bg-foreground hover:text-background"
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar a PDF
              </Button>
            )}
            {user ? (
              <Button
                onClick={onLogout}
                variant="outline"
                className="border-foreground text-foreground hover:bg-foreground hover:text-background"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </Button>
            ) : (
              <Button
                onClick={onLogin}
                variant="outline"
                className="border-foreground text-foreground hover:bg-foreground hover:text-background"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Ingreso admin
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
