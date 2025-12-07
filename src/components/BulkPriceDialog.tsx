import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Percent } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "./ProductCard";

interface BulkPriceDialogProps {
  products: Product[];
  onProductsUpdate: (products: Product[]) => void;
  brand: string;
}

const CATEGORIES = [
  { value: "all", label: "Todas las categorías" },
  { value: "Remeras", label: "Remeras" },
  { value: "Buzos", label: "Buzos" },
  { value: "Zapatillas", label: "Zapatillas" },
  { value: "Pantalones", label: "Pantalones" },
  { value: "Camperas", label: "Camperas" },
  { value: "Accesorios", label: "Accesorios" },
];

export const BulkPriceDialog = ({ products, onProductsUpdate, brand }: BulkPriceDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [percentage, setPercentage] = useState("");
  const [isIncrease, setIsIncrease] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleApplyChange = async () => {
    const percentageValue = parseFloat(percentage);
    
    if (isNaN(percentageValue) || percentageValue <= 0 || percentageValue > 100) {
      toast.error("Ingresa un porcentaje válido (1-100)");
      return;
    }

    setIsLoading(true);

    try {
      // Filter products by category and brand
      const productsToUpdate = products.filter(p => {
        const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
        return matchesCategory;
      });

      if (productsToUpdate.length === 0) {
        toast.error("No hay productos en esta categoría");
        setIsLoading(false);
        return;
      }

      const multiplier = isIncrease 
        ? 1 + (percentageValue / 100) 
        : 1 - (percentageValue / 100);

      // Update each product
      const updatePromises = productsToUpdate.map(async (product) => {
        const newPrice = Math.round(product.price * multiplier * 100) / 100;
        
        const { error } = await supabase
          .from('products')
          .update({ price: newPrice })
          .eq('id', String(product.id));

        if (error) throw error;

        return { ...product, price: newPrice };
      });

      const updatedProducts = await Promise.all(updatePromises);

      // Update state with new prices
      const newProductsList = products.map(p => {
        const updated = updatedProducts.find(up => up.id === p.id);
        return updated || p;
      });

      onProductsUpdate(newProductsList);

      const categoryLabel = CATEGORIES.find(c => c.value === selectedCategory)?.label || selectedCategory;
      const action = isIncrease ? "aumentados" : "reducidos";
      toast.success(`Precios ${action} ${percentageValue}% para ${categoryLabel.toLowerCase()}`);
      
      setIsOpen(false);
      setPercentage("");
      setSelectedCategory("all");
    } catch (error) {
      console.error('Error updating prices:', error);
      toast.error('Error al actualizar los precios');
    } finally {
      setIsLoading(false);
    }
  };

  const affectedCount = products.filter(p => 
    selectedCategory === "all" || p.category === selectedCategory
  ).length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Percent className="h-4 w-4" />
          Cambiar Precios
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Cambio Masivo de Precios</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Categoría</Label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {affectedCount} {affectedCount === 1 ? "producto" : "productos"} afectados
            </p>
          </div>

          <div className="grid gap-2">
            <Label>Acción</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={isIncrease ? "default" : "outline"}
                onClick={() => setIsIncrease(true)}
                className="flex-1"
              >
                Aumentar
              </Button>
              <Button
                type="button"
                variant={!isIncrease ? "default" : "outline"}
                onClick={() => setIsIncrease(false)}
                className="flex-1"
              >
                Reducir
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="percentage">Porcentaje (%)</Label>
            <Input
              id="percentage"
              type="number"
              min="1"
              max="100"
              step="1"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              placeholder="Ej: 10"
            />
          </div>

          <Button 
            onClick={handleApplyChange} 
            className="w-full"
            disabled={isLoading || !percentage}
          >
            {isLoading ? "Aplicando..." : `${isIncrease ? "Aumentar" : "Reducir"} ${percentage || "0"}%`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
