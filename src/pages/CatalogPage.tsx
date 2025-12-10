import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ProductCard, Product, SortableProductCard } from "@/components/ProductCard";
import { CatalogHeader } from "@/components/CatalogHeader";
import { BulkPriceDialog } from "@/components/BulkPriceDialog";
import { exportToPDF } from "@/utils/pdfExport";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, X, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { z } from "zod";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
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

const productSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido").max(200, "El nombre es demasiado largo"),
  category: z.enum(["Remeras", "Buzos", "Zapatillas", "Pantalones", "Camperas", "Accesorios"], { errorMap: () => ({ message: "Categoría inválida" }) }),
  price: z.number().positive("El precio debe ser positivo").max(999999, "El precio es demasiado alto"),
  sizes: z.array(z.string().trim().min(1)).min(1, "Debe agregar al menos una talla"),
  images: z.array(z.string()).min(1, "Debe agregar al menos una imagen").max(10, "Máximo 10 imágenes"),
  seña: z.number().nonnegative("La seña no puede ser negativa").max(999999, "La seña es demasiado alta").optional(),
});

interface CatalogPageProps {
  brand: "anine-bing" | "golden-goose";
}

const BRAND_NAMES: Record<string, string> = {
  "anine-bing": "Anine Bing",
  "golden-goose": "Golden Goose",
};

const CatalogPage = ({ brand }: CatalogPageProps) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "Remeras",
    images: [] as string[],
    sizes: "",
    price: "",
    seña: "",
  });

  const brandName = BRAND_NAMES[brand];

  // Check authentication and load products
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    loadProducts();

    return () => subscription.unsubscribe();
  }, [brand]);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (error) throw error;
        setIsAdmin(!!data);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('brand', brand)
        .order('display_order', { ascending: true });

      if (error) throw error;

      const formattedProducts: Product[] = data.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        images: item.images,
        sizes: item.sizes,
        price: item.price,
        seña: item.seña || undefined,
      }));

      setProducts(formattedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Error al cargar los productos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = products.findIndex((p) => String(p.id) === active.id);
      const newIndex = products.findIndex((p) => String(p.id) === over.id);

      const newProducts = arrayMove(products, oldIndex, newIndex);
      setProducts(newProducts);

      // Update display_order in database
      try {
        const updates = newProducts.map((product, index) => ({
          id: String(product.id),
          display_order: index,
        }));

        for (const update of updates) {
          await supabase
            .from('products')
            .update({ display_order: update.display_order })
            .eq('id', update.id);
        }
      } catch (error) {
        console.error('Error updating order:', error);
        toast.error('Error al guardar el orden');
        loadProducts(); // Reload on error
      }
    }
  };

  const handlePriceUpdate = async (id: number | string, newPrice: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ price: newPrice })
        .eq('id', String(id));

      if (error) throw error;

      setProducts((prev) =>
        prev.map((product) =>
          product.id === id ? { ...product, price: newPrice } : product
        )
      );
      toast.success("Precio actualizado correctamente");
    } catch (error) {
      console.error('Error updating price:', error);
      toast.error('Error al actualizar el precio');
    }
  };

  const handleSizesUpdate = async (id: number | string, newSizes: string[]) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ sizes: newSizes })
        .eq('id', String(id));

      if (error) throw error;

      setProducts((prev) =>
        prev.map((product) =>
          product.id === id ? { ...product, sizes: newSizes } : product
        )
      );
      toast.success("Talles actualizados correctamente");
    } catch (error) {
      console.error('Error updating sizes:', error);
      toast.error('Error al actualizar los talles');
    }
  };

  const handleImagesUpdate = async (id: number | string, newImages: string[]) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ images: newImages })
        .eq('id', String(id));

      if (error) throw error;

      setProducts((prev) =>
        prev.map((product) =>
          product.id === id ? { ...product, images: newImages } : product
        )
      );
      toast.success("Imágenes actualizadas correctamente");
    } catch (error) {
      console.error('Error updating images:', error);
      toast.error('Error al actualizar las imágenes');
    }
  };

  const handleNameUpdate = async (id: number | string, newName: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ name: newName })
        .eq('id', String(id));

      if (error) throw error;

      setProducts((prev) =>
        prev.map((product) =>
          product.id === id ? { ...product, name: newName } : product
        )
      );
      toast.success("Nombre actualizado correctamente");
    } catch (error) {
      console.error('Error updating name:', error);
      toast.error('Error al actualizar el nombre');
    }
  };

  const handleSeñaUpdate = async (id: number | string, newSeña: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ seña: newSeña })
        .eq('id', String(id));

      if (error) throw error;

      setProducts((prev) =>
        prev.map((product) =>
          product.id === id ? { ...product, seña: newSeña } : product
        )
      );
      toast.success("Seña actualizada correctamente");
    } catch (error) {
      console.error('Error updating seña:', error);
      toast.error('Error al actualizar la seña');
    }
  };

  const handleDeleteProduct = async (id: number | string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', String(id));

      if (error) throw error;

      setProducts((prev) => prev.filter((product) => product.id !== id));
      toast.success("Producto eliminado correctamente");
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar el producto');
    }
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
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const newImages: string[] = [];
      
      fileArray.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result as string);
          if (newImages.length === fileArray.length) {
            setNewProduct({ ...newProduct, images: [...newProduct.images, ...newImages] });
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveNewProductImage = (indexToRemove: number) => {
    setNewProduct({
      ...newProduct,
      images: newProduct.images.filter((_, index) => index !== indexToRemove)
    });
  };

  const handleAddProduct = async () => {
    if (!isAdmin) {
      toast.error("No tienes permisos para agregar productos");
      return;
    }

    const sizesArray = newProduct.sizes
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter((s) => s);

    const priceValue = parseFloat(newProduct.price);
    const señaValue = newProduct.seña ? parseFloat(newProduct.seña) : undefined;

    try {
      const validationResult = productSchema.safeParse({
        name: newProduct.name,
        category: newProduct.category,
        price: priceValue,
        sizes: sizesArray,
        images: newProduct.images,
        seña: señaValue,
      });

      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast.error(firstError.message);
        return;
      }

      const validatedData = validationResult.data;

      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: validatedData.name,
          category: validatedData.category,
          images: validatedData.images,
          sizes: validatedData.sizes,
          price: validatedData.price,
          seña: validatedData.seña || null,
          brand: brand,
        }])
        .select()
        .single();

      if (error) throw error;

      const product: Product = {
        id: data.id,
        name: data.name,
        category: data.category,
        images: data.images,
        sizes: data.sizes,
        price: data.price,
        seña: data.seña || undefined,
      };

      setProducts([product, ...products]);
      setNewProduct({
        name: "",
        category: "Remeras",
        images: [],
        sizes: "",
        price: "",
        seña: "",
      });
      setIsDialogOpen(false);
      toast.success("Producto agregado correctamente");
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Error al agregar el producto');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Sesión cerrada correctamente");
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error("Error al cerrar sesión");
    }
  };

  const handleProductsUpdate = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
  };

  return (
    <div className="min-h-screen bg-background">
      <CatalogHeader 
        onExportPDF={handleExportPDF} 
        isAdmin={isAdmin} 
        user={user}
        onLogout={handleLogout}
        onLogin={() => navigate("/auth")}
        brandName={brandName}
      />
      
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Button>
        </div>

        {brand === "golden-goose" && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <div className="max-w-2xl mx-auto">
              <div className="relative overflow-hidden rounded-lg border border-foreground/10 bg-gradient-to-br from-card via-card to-muted/30 p-6 md:p-8">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-foreground/5 rounded-full blur-2xl" />
                <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-foreground/5 rounded-full blur-xl" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center">
                      <span className="text-sm">💵</span>
                    </div>
                    <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-foreground/80">
                      Información de precios
                    </h3>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                    <span className="text-foreground font-medium">El precio es en USD</span>
                  </p>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {isAdmin && (
          <div className="mb-8 flex flex-wrap gap-3 justify-end">
            <BulkPriceDialog 
              products={products} 
              onProductsUpdate={handleProductsUpdate}
              brand={brand}
            />
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Agregar Producto
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Agregar Nuevo Producto - {brandName}</DialogTitle>
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
                        <SelectItem value="Remeras">Remeras</SelectItem>
                        <SelectItem value="Buzos">Buzos</SelectItem>
                        <SelectItem value="Zapatillas">Zapatillas</SelectItem>
                        <SelectItem value="Pantalones">Pantalones</SelectItem>
                        <SelectItem value="Camperas">Camperas</SelectItem>
                        <SelectItem value="Accesorios">Accesorios</SelectItem>
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
                      onChange={(e) => {
                        const price = e.target.value;
                        const priceNum = parseFloat(price);
                        const autoSeña = !isNaN(priceNum) && priceNum > 0 
                          ? (priceNum * 0.5).toFixed(2) 
                          : "";
                        setNewProduct({ 
                          ...newProduct, 
                          price: price,
                          seña: autoSeña
                        });
                      }}
                      placeholder="0.00"
                    />
                  </div>
                  {brand !== "golden-goose" && (
                    <div className="grid gap-2">
                      <Label htmlFor="seña">Seña (50% automático, editable)</Label>
                      <Input
                        id="seña"
                        type="number"
                        step="0.01"
                        value={newProduct.seña}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, seña: e.target.value })
                        }
                        placeholder="0.00"
                      />
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="image">Imágenes del producto</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                    />
                    {newProduct.images.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {newProduct.images.map((img, index) => (
                          <div key={index} className="relative">
                            <img
                              src={img}
                              alt={`Preview ${index + 1}`}
                              className="h-24 w-24 rounded object-cover"
                            />
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRemoveNewProductImage(index)}
                              className="absolute -right-2 -top-2 h-6 w-6 rounded-full p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button onClick={handleAddProduct} className="w-full">
                    Agregar Producto
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={products.map((p) => String(p.id))}
            strategy={rectSortingStrategy}
          >
            <div className="product-grid-container grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {isLoading ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12 gap-4">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  <p className="text-muted-foreground">Cargando productos...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="col-span-full flex justify-center py-12">
                  <p className="text-muted-foreground">No hay productos. Agrega tu primer producto!</p>
                </div>
              ) : (
                products.map((product) => (
                  isAdmin ? (
                    <SortableProductCard
                      key={product.id}
                      product={product}
                      isAdmin={isAdmin}
                      brand={brand}
                      onPriceUpdate={handlePriceUpdate}
                      onSizesUpdate={handleSizesUpdate}
                      onImagesUpdate={handleImagesUpdate}
                      onNameUpdate={handleNameUpdate}
                      onDelete={handleDeleteProduct}
                      onSeñaUpdate={handleSeñaUpdate}
                    />
                  ) : (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isAdmin={isAdmin}
                      brand={brand}
                      onPriceUpdate={handlePriceUpdate}
                      onSizesUpdate={handleSizesUpdate}
                      onImagesUpdate={handleImagesUpdate}
                      onNameUpdate={handleNameUpdate}
                      onDelete={handleDeleteProduct}
                      onSeñaUpdate={handleSeñaUpdate}
                    />
                  )
                ))
              )}
            </div>
          </SortableContext>
        </DndContext>
      </main>

      <footer className="border-t border-border bg-background py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-light text-muted-foreground">
            Hecho con <span className="text-red-500 animate-pulse">❤️</span> por
            Tefi • {products.length}{" "}
            {products.length === 1 ? "producto" : "productos"}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CatalogPage;
