import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border py-6">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-light tracking-[0.3em] uppercase text-foreground">
            Catálogo
          </h1>
        </div>
      </header>

      {/* Outlet Disclaimer */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="px-4 pt-8"
      >
        <div className="max-w-2xl mx-auto">
          <div className="relative overflow-hidden rounded-lg border border-foreground/10 bg-gradient-to-br from-card via-card to-muted/30 p-6 md:p-8">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-foreground/5 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-foreground/5 rounded-full blur-xl" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center">
                  <span className="text-sm">✨</span>
                </div>
                <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-foreground/80">
                  ¿Qué es un producto outlet?
                </h3>
              </div>
              
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                Mantiene la calidad y autenticidad de la marca, pero no ingresó a boutique por no cumplir sus estándares ultra exigentes de terminación. No afecta la funcionalidad; solo reduce el precio. <span className="text-foreground font-medium">Mismo lujo, valor más accesible.</span>
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl w-full">
          {/* Anine Bing Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onClick={() => navigate("/anine-bing")}
            className="group cursor-pointer"
          >
            <div className="relative overflow-hidden rounded-lg border border-border bg-card aspect-[3/4] md:aspect-[4/5] flex flex-col items-center justify-center transition-all duration-300 hover:shadow-2xl hover:border-foreground/30 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 text-center p-8">
                <h2 className="text-4xl md:text-5xl font-light tracking-[0.2em] uppercase text-foreground mb-4 group-hover:tracking-[0.3em] transition-all duration-300">
                  Anine Bing
                </h2>
                <p className="text-muted-foreground text-sm tracking-widest uppercase opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                  Ver colección
                </p>
                <div className="mt-6 w-12 h-[1px] bg-foreground/30 mx-auto group-hover:w-24 transition-all duration-300" />
              </div>
            </div>
          </motion.div>

          {/* Golden Goose Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onClick={() => navigate("/golden-goose")}
            className="group cursor-pointer"
          >
            <div className="relative overflow-hidden rounded-lg border border-border bg-card aspect-[3/4] md:aspect-[4/5] flex flex-col items-center justify-center transition-all duration-300 hover:shadow-2xl hover:border-foreground/30 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 text-center p-8">
                <h2 className="text-4xl md:text-5xl font-light tracking-[0.2em] uppercase text-foreground mb-4 group-hover:tracking-[0.3em] transition-all duration-300">
                  Golden Goose
                </h2>
                <p className="text-muted-foreground text-sm tracking-widest uppercase opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                  Ver colección
                </p>
                <div className="mt-6 w-12 h-[1px] bg-foreground/30 mx-auto group-hover:w-24 transition-all duration-300" />
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="border-t border-border bg-background py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-light text-muted-foreground">
            Hecho con <span className="text-red-500 animate-pulse">❤️</span> por Tefi
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
