import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Check, X } from "lucide-react";

export interface Product {
  id: number;
  name: string;
  category: string;
  image: string;
  sizes: string[];
  price: number;
}

interface ProductCardProps {
  product: Product;
  onPriceUpdate: (id: number, newPrice: number) => void;
}

export const ProductCard = ({ product, onPriceUpdate }: ProductCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrice, setEditedPrice] = useState(product.price.toString());

  const handleSave = () => {
    const newPrice = parseFloat(editedPrice);
    if (!isNaN(newPrice) && newPrice > 0) {
      onPriceUpdate(product.id, newPrice);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedPrice(product.price.toString());
    setIsEditing(false);
  };

  return (
    <Card className="group overflow-hidden border-border bg-card transition-all hover:shadow-lg">
      <div className="aspect-[3/4] overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="space-y-3 p-4">
        <div>
          <p className="text-xs font-light uppercase tracking-wider text-muted-foreground">
            {product.category}
          </p>
          <h3 className="mt-1 font-medium text-foreground">{product.name}</h3>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {product.sizes.map((size) => (
            <Badge
              key={size}
              variant="outline"
              className="border-border bg-background text-xs font-light"
            >
              {size}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={editedPrice}
                onChange={(e) => setEditedPrice(e.target.value)}
                className="h-8 w-24 text-sm"
                step="0.01"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSave}
                className="h-8 w-8 p-0"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancel}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <span className="text-lg font-medium text-foreground">
                ${product.price.toFixed(2)}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};
