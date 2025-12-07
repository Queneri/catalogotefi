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

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
          {/* Anine Bing Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => navigate("/anine-bing")}
            className="group cursor-pointer"
          >
            <div className="relative overflow-hidden rounded-lg border border-border bg-card aspect-[4/5] flex flex-col items-center justify-center transition-all duration-300 hover:shadow-xl hover:border-foreground/20">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />
              <div className="relative z-10 text-center p-8">
                <h2 className="text-4xl md:text-5xl font-light tracking-[0.2em] uppercase text-foreground mb-4 group-hover:tracking-[0.3em] transition-all duration-300">
                  Anine Bing
                </h2>
                <p className="text-muted-foreground text-sm tracking-widest uppercase">
                  Ver colección
                </p>
                <div className="mt-6 w-12 h-[1px] bg-foreground/30 mx-auto group-hover:w-24 transition-all duration-300" />
              </div>
            </div>
          </motion.div>

          {/* Golden Goose Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onClick={() => navigate("/golden-goose")}
            className="group cursor-pointer"
          >
            <div className="relative overflow-hidden rounded-lg border border-border bg-card aspect-[4/5] flex flex-col items-center justify-center transition-all duration-300 hover:shadow-xl hover:border-foreground/20">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />
              <div className="relative z-10 text-center p-8">
                <h2 className="text-4xl md:text-5xl font-light tracking-[0.2em] uppercase text-foreground mb-4 group-hover:tracking-[0.3em] transition-all duration-300">
                  Golden Goose
                </h2>
                <p className="text-muted-foreground text-sm tracking-widest uppercase">
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
