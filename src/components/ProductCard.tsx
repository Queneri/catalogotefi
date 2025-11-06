import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Check, X, Upload, Plus, Trash2 } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export interface Product {
  id: number;
  name: string;
  category: string;
  images: string[];
  sizes: string[];
  price: number;
}

interface ProductCardProps {
  product: Product;
  onPriceUpdate: (id: number, newPrice: number) => void;
  onSizesUpdate: (id: number, newSizes: string[]) => void;
  onImagesUpdate: (id: number, newImages: string[]) => void;
  onNameUpdate: (id: number, newName: string) => void;
}

export const ProductCard = ({ 
  product, 
  onPriceUpdate, 
  onSizesUpdate, 
  onImagesUpdate,
  onNameUpdate 
}: ProductCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrice, setEditedPrice] = useState(product.price.toString());
  const [editedSizes, setEditedSizes] = useState<string[]>(product.sizes);
  const [editedName, setEditedName] = useState(product.name);
  const [newSize, setNewSize] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    const newPrice = parseFloat(editedPrice);
    if (!isNaN(newPrice) && newPrice > 0) {
      onPriceUpdate(product.id, newPrice);
      onSizesUpdate(product.id, editedSizes);
      onNameUpdate(product.id, editedName);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedPrice(product.price.toString());
    setEditedSizes(product.sizes);
    setEditedName(product.name);
    setIsEditing(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const newImages: string[] = [];
      
      fileArray.forEach((file, index) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result as string);
          if (newImages.length === fileArray.length) {
            onImagesUpdate(product.id, [...product.images, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updatedImages = product.images.filter((_, index) => index !== indexToRemove);
    if (updatedImages.length > 0) {
      onImagesUpdate(product.id, updatedImages);
    }
  };

  const handleAddSize = () => {
    if (newSize.trim() && !editedSizes.includes(newSize.trim().toUpperCase())) {
      setEditedSizes([...editedSizes, newSize.trim().toUpperCase()]);
      setNewSize("");
    }
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    setEditedSizes(editedSizes.filter(size => size !== sizeToRemove));
  };

  return (
    <Card className="group overflow-hidden border-border bg-card transition-all hover:shadow-lg">
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <Carousel className="h-full w-full">
          <CarouselContent>
            {product.images.map((image, index) => (
              <CarouselItem key={index} className="relative">
                <img
                  src={image}
                  alt={`${product.name} - ${index + 1}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {isEditing && product.images.length > 1 && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute right-2 top-2"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </CarouselItem>
            ))}
          </CarouselContent>
          {product.images.length > 1 && (
            <>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </>
          )}
        </Carousel>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <Upload className="mr-1 h-3 w-3" />
          {product.images.length > 0 ? "Agregar" : "Subir"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="hidden"
        />
      </div>
      <div className="space-y-3 p-4">
        <div>
          <p className="text-xs font-light uppercase tracking-wider text-muted-foreground">
            {product.category}
          </p>
          {isEditing ? (
            <Input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="mt-1 h-8 text-sm font-medium"
            />
          ) : (
            <h3 className="mt-1 font-medium text-foreground">{product.name}</h3>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {editedSizes.map((size) => (
                <Badge
                  key={size}
                  variant="outline"
                  className="group/badge border-border bg-background text-xs font-light"
                >
                  {size}
                  <button
                    onClick={() => handleRemoveSize(size)}
                    className="ml-1 opacity-0 transition-opacity group-hover/badge:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-1">
              <Input
                placeholder="Nuevo talle"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddSize()}
                className="h-7 text-xs"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddSize}
                className="h-7 w-7 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
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
        )}

        <div className="flex items-center justify-between border-t border-border pt-3">
          {isEditing ? (
            <div className="flex w-full items-center gap-2">
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
