import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import heroBackground from "@/assets/hero-background.jpg";

const Welcome = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBackground})` }}
      />
      
      <div className="relative z-10">
        <Header />
        
        <main className="container mx-auto px-6 pt-32 pb-16 text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 text-primary" style={{ fontFamily: 'cursive' }}>
            Welcome to
            <br />
            SNUGGLEMIND
          </h1>
          
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 text-foreground/80">
            A safe space for early adolescents to share their feelings through conversation and connection,
            helping mental health professionals provide better support.
          </p>
          
          <Link to="/about">
            <Button size="lg" className="rounded-full text-lg px-8 py-6">
              LEARN MORE
            </Button>
          </Link>
        </main>
      </div>
    </div>
  );
};

export default Welcome;
