import { useState, useRef, forwardRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Check, X, Upload, Plus, Trash2, ChevronUp, ChevronDown, MessageCircle, GripVertical } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export interface Product {
  id: number | string;
  name: string;
  category: string;
  images: string[];
  sizes: string[];
  price: number;
  seña?: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  "T-Shirts": "Remeras",
  "Sweatshirts": "Buzos",
  "Shoes": "Zapatillas",
  "Pants": "Pantalones",
  "Jackets": "Camperas",
  "Accessories": "Accesorios",
  "Remeras": "Remeras",
  "Buzos": "Buzos",
  "Zapatillas": "Zapatillas",
  "Pantalones": "Pantalones",
  "Camperas": "Camperas",
  "Accesorios": "Accesorios",
};

interface ProductCardProps {
  product: Product;
  isAdmin: boolean;
  brand?: "anine-bing" | "golden-goose";
  onPriceUpdate: (id: number | string, newPrice: number) => void;
  onSizesUpdate: (id: number | string, newSizes: string[]) => void;
  onImagesUpdate: (id: number | string, newImages: string[]) => void;
  onNameUpdate: (id: number | string, newName: string) => void;
  onDelete: (id: number | string) => void;
  onSeñaUpdate: (id: number | string, newSeña: number) => void;
  isDragging?: boolean;
}

export const SortableProductCard = (props: ProductCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(props.product.id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ProductCard {...props} isDragging={isDragging} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  );
};

interface ProductCardInternalProps extends ProductCardProps {
  dragHandleProps?: Record<string, any>;
}

export const ProductCard = ({ 
  product,
  isAdmin,
  brand,
  onPriceUpdate, 
  onSizesUpdate, 
  onImagesUpdate,
  onNameUpdate,
  onDelete,
  onSeñaUpdate,
  isDragging,
  dragHandleProps,
}: ProductCardInternalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrice, setEditedPrice] = useState(product.price.toString());
  const [editedSeña, setEditedSeña] = useState(product.seña?.toString() || "");
  const [editedSizes, setEditedSizes] = useState<string[]>(product.sizes);
  const [editedName, setEditedName] = useState(product.name);
  const [newSize, setNewSize] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    const newPrice = parseFloat(editedPrice);
    const newSeña = editedSeña ? parseFloat(editedSeña) : 0;
    if (!isNaN(newPrice) && newPrice > 0) {
      onPriceUpdate(product.id, newPrice);
      onSizesUpdate(product.id, editedSizes);
      onNameUpdate(product.id, editedName);
      if (!isNaN(newSeña)) {
        onSeñaUpdate(product.id, newSeña);
      }
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedPrice(product.price.toString());
    setEditedSeña(product.seña?.toString() || "");
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

  const handleMoveImageUp = (index: number) => {
    if (index > 0) {
      const newImages = [...product.images];
      [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
      onImagesUpdate(product.id, newImages);
    }
  };

  const handleMoveImageDown = (index: number) => {
    if (index < product.images.length - 1) {
      const newImages = [...product.images];
      [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
      onImagesUpdate(product.id, newImages);
    }
  };

  return (
    <Card className="group relative overflow-hidden border-border bg-card transition-all hover:shadow-lg">
      {isAdmin && (
        <>
          {/* Drag handle */}
          <div
            {...dragHandleProps}
            className="absolute left-2 top-2 z-10 flex h-8 w-8 cursor-grab items-center justify-center rounded bg-background/80 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="destructive"
                className="absolute right-2 top-2 z-10 h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. El producto "{product.name}" será eliminado permanentemente del catálogo.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(product.id)}>
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
      
      <div className={`relative aspect-square overflow-hidden ${brand === "golden-goose" ? "bg-white" : "bg-muted"}`}>
        <Carousel className="h-full w-full">
          <CarouselContent className="h-full">
            {product.images.map((image, index) => (
              <CarouselItem key={index} className="relative h-full">
                <img
                  src={image}
                  alt={`${product.name} - ${index + 1}`}
                  className={`h-full w-full transition-transform duration-500 group-hover:scale-105 ${
                    brand === "golden-goose" 
                      ? "object-contain object-center" 
                      : "object-cover"
                  }`}
                />
                {isAdmin && isEditing && (
                  <div className="absolute right-2 top-2 flex flex-col gap-1">
                    {index > 0 && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleMoveImageUp(index)}
                        className="h-7 w-7 p-0"
                      >
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                    )}
                    {index < product.images.length - 1 && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleMoveImageDown(index)}
                        className="h-7 w-7 p-0"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    )}
                    {product.images.length > 1 && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveImage(index)}
                        className="h-7 w-7 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
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
        {isAdmin && (
          <>
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
          </>
        )}
      </div>
      <div className="space-y-3 p-4">
        <div>
          <p className="text-xs font-light uppercase tracking-wider text-muted-foreground">
            {CATEGORY_LABELS[product.category] || product.category}
          </p>
          {isAdmin && isEditing ? (
            <Input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="mt-1 h-8 text-sm font-medium"
            />
          ) : (
            <h3 className="mt-1 font-medium text-foreground">{product.name}</h3>
          )}
        </div>

        {isAdmin && isEditing ? (
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

        <div className="border-t border-border pt-3">
          {isAdmin && isEditing ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-12">Precio:</span>
                <Input
                  type="number"
                  value={editedPrice}
                  onChange={(e) => setEditedPrice(e.target.value)}
                  className="h-8 flex-1 text-sm"
                  step="0.01"
                />
              </div>
              {brand !== "golden-goose" && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-12">Seña:</span>
                  <Input
                    type="number"
                    value={editedSeña}
                    onChange={(e) => setEditedSeña(e.target.value)}
                    className="h-8 flex-1 text-sm"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              )}
              <div className="flex gap-2 justify-end">
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
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-medium text-foreground">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                  {brand !== "golden-goose" && product.seña !== undefined && product.seña > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Seña: ${product.seña.toFixed(2)}
                    </div>
                  )}
                </div>
                {isAdmin && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditing(true)}
                    className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {!isAdmin && (
                <a
                  href={`https://wa.me/5491123197552?text=${encodeURIComponent(`Hola! Me interesa el producto:\n\n*${product.name}*\nPrecio: $${product.price.toFixed(2)}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button
                    size="sm"
                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Comprar
                  </Button>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
