import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProductCard, Product } from "@/components/ProductCard";
import { CatalogHeader } from "@/components/CatalogHeader";
import { exportToPDF } from "@/utils/pdfExport";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
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
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "T-Shirts",
    images: [] as string[],
    sizes: "",
    price: "",
  });

  // Check authentication and load products
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    loadProducts();

    return () => subscription.unsubscribe();
  }, []);

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

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedProducts: Product[] = data.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        images: item.images,
        sizes: item.sizes,
        price: item.price,
      }));

      setProducts(formattedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Error al cargar los productos');
    } finally {
      setIsLoading(false);
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

    if (!newProduct.name || !newProduct.price || !newProduct.sizes || newProduct.images.length === 0) {
      toast.error("Por favor completa todos los campos y agrega al menos una imagen");
      return;
    }

    const sizesArray = newProduct.sizes
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter((s) => s);

    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: newProduct.name,
          category: newProduct.category,
          images: newProduct.images,
          sizes: sizesArray,
          price: parseFloat(newProduct.price),
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
      };

      setProducts([product, ...products]);
      setNewProduct({
        name: "",
        category: "T-Shirts",
        images: [],
        sizes: "",
        price: "",
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

  return (
    <div className="min-h-screen bg-background">
      <CatalogHeader 
        onExportPDF={handleExportPDF} 
        isAdmin={isAdmin} 
        user={user}
        onLogout={handleLogout}
        onLogin={() => navigate("/auth")}
      />
      
      <main className="container mx-auto px-4 py-12">
        {isAdmin && (
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

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-12">
            <p className="text-muted-foreground">Cargando productos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="col-span-full flex justify-center py-12">
            <p className="text-muted-foreground">No hay productos. Agrega tu primer producto!</p>
          </div>
        ) : (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isAdmin={isAdmin}
              onPriceUpdate={handlePriceUpdate}
              onSizesUpdate={handleSizesUpdate}
              onImagesUpdate={handleImagesUpdate}
              onNameUpdate={handleNameUpdate}
              onDelete={handleDeleteProduct}
            />
          ))
        )}
        </div>
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

export default Index;
