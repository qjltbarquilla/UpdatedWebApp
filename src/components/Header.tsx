import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="absolute top-0 left-0 right-0 z-10 px-6 py-4 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <div className="text-2xl font-bold text-primary">
          SNUGGLEMIND
        </div>
      </Link>
      
      <nav className="hidden md:flex items-center gap-6">
        <Link to="/about" className="text-foreground hover:text-primary transition-colors">
          About us
        </Link>
        <Link to="/contact" className="text-foreground hover:text-primary transition-colors">
          Contact
        </Link>
        <Link to="/register">
          <Button variant="outline" className="rounded-full">
            Register
          </Button>
        </Link>
      </nav>
    </header>
  );
};
