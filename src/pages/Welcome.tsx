//Welcome Page
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import BackgroundImage from "@/assets/BackgroundImage.jpg";

const Welcome = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${BackgroundImage})` }}
      />

      <div className="relative z-10">
        <Header />

        <main className="container mx-auto px-6 pt-32 pb-16 text-center">
          <h1
            className="md:text-7xl font-normal text-primary"
            style={{ fontFamily: "Alef, sans-serif", 
                     fontSize: "40px" }}
          >
            Welcome to
          </h1>
          <h1
            className="md:text-8xl font-bold mb-6 text-primary tracking-tight"
            style={{ fontFamily: '"Amatica SC", cursive', fontSize: "128px" }}
          >
            SNUGGLEMIND
          </h1>

          <p className="md:text-xl max-w-2xl mx-auto mb-8 text-primary">
            A safe space for early adolescents to share their feelings through
            conversation and connection, helping mental health professionals
            provide better support.
          </p>

          <Link to="/about">
            <Button size="lg" className="rounded-full text-primary-foreground font-bold px-8 py-5"
                    style={{fontFamily: "Alef, sans-serif", fontSize: "16px"}}>
              LEARN MORE
            </Button>
          </Link>
        </main>
      </div>
    </div>
  );
};

export default Welcome;
