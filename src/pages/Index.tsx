import { useState } from "react";
import { ProductCard, Product } from "@/components/ProductCard";
import { CatalogHeader } from "@/components/CatalogHeader";
import { initialProducts } from "@/data/products";
import { exportToPDF } from "@/utils/pdfExport";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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

const Index = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "T-Shirts",
    image: "",
    sizes: "",
    price: "",
  });

  const handlePriceUpdate = (id: number, newPrice: number) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, price: newPrice } : product
      )
    );
    toast.success("Precio actualizado correctamente");
  };

  const handleSizesUpdate = (id: number, newSizes: string[]) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, sizes: newSizes } : product
      )
    );
  };

  const handleImageUpdate = (id: number, newImage: string) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, image: newImage } : product
      )
    );
    toast.success("Imagen actualizada correctamente");
  };

  const handleNameUpdate = (id: number, newName: string) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, name: newName } : product
      )
    );
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.sizes || !newProduct.image) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    const sizesArray = newProduct.sizes
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter((s) => s);

    const product: Product = {
      id: Math.max(...products.map((p) => p.id)) + 1,
      name: newProduct.name,
      category: newProduct.category,
      image: newProduct.image,
      sizes: sizesArray,
      price: parseFloat(newProduct.price),
    };

    setProducts([...products, product]);
    setNewProduct({
      name: "",
      category: "T-Shirts",
      image: "",
      sizes: "",
      price: "",
    });
    setIsDialogOpen(false);
    toast.success("Producto agregado correctamente");
  };

  return (
    <div className="min-h-screen bg-background">
      <CatalogHeader onExportPDF={handleExportPDF} />
      
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8 flex justify-end">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Agregar Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Producto</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre del producto</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    placeholder="Ej: Classic White Tee"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select
                    value={newProduct.category}
                    onValueChange={(value) =>
                      setNewProduct({ ...newProduct, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="T-Shirts">Remeras</SelectItem>
                      <SelectItem value="Sweatshirts">Buzos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sizes">Talles (separados por coma)</Label>
                  <Input
                    id="sizes"
                    value={newProduct.sizes}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, sizes: e.target.value })
                    }
                    placeholder="Ej: XS, S, M, L, XL"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price">Precio</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="image">Imagen del producto</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  {newProduct.image && (
                    <img
                      src={newProduct.image}
                      alt="Preview"
                      className="mt-2 h-32 w-32 rounded object-cover"
                    />
                  )}
                </div>
                <Button onClick={handleAddProduct} className="w-full">
                  Agregar Producto
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onPriceUpdate={handlePriceUpdate}
              onSizesUpdate={handleSizesUpdate}
              onImageUpdate={handleImageUpdate}
              onNameUpdate={handleNameUpdate}
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
