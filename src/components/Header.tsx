import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="absolute top-0 left-0 right-0 z-10 px-6 py-4 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <div className="text-primary hover:text-primary hover:font-bold transition-colors"
             style={{fontSize: "15px"}}>
          SNUGGLEMIND
        </div>
      </Link>
      
      <nav className="hidden md:flex items-center gap-6">
        <Link to="/about" className="text-primary hover:text-primary hover:font-bold transition-colors"
                          style={{fontSize: "15px"}}>
          About us
        </Link>
        <Link to="/contact" className="text-primary hover:text-primary hover:font-bold transition-colors"
                            style={{fontSize: "15px"}}>
          Contact
        </Link>
        <Link to="/register">
          <Button className="rounded-full border border-primary text-primary font-normal bg-transparent hover:border-2 hover:bg-transparent hover:text-primary hover:font-bold transition-all"
                  style={{fontSize: "15px"}}>
            Register
          </Button>
        </Link>
      </nav>
    </header>
  );
};
