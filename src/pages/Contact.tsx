import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { MapPin, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import heroBackground from "@/assets/hero-background.jpg";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent successfully! We'll get back to you soon.");
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-50"
        style={{ backgroundImage: `url(${heroBackground})` }}
      />

      <div className="relative z-10">
        <Header />

        <main className="container mx-auto px-6 pt-32 pb-16">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div>
              <h1 className="text-5xl font-bold mb-6 text-foreground">
                Get in touch with us
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                We would love to hear from you
              </p>

              <p className="text-foreground/80 mb-8 leading-relaxed">
                Have questions about SnuggleMind or want to learn more about how
                our system can support mental health screening for children?
                Reach out to us and we'll be happy to help.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-muted/60 backdrop-blur-sm p-4 rounded-lg">
                  <MapPin className="h-6 w-6 text-primary" />
                  <span className="text-foreground">
                    Jan lang sa tabi-tabi sa kalye
                  </span>
                </div>
                <div className="flex items-center gap-3 bg-muted/60 backdrop-blur-sm p-4 rounded-lg">
                  <Mail className="h-6 w-6 text-primary" />
                  <a
                    href="mailto:snugglemind@gmail.com"
                    className="text-foreground hover:text-primary transition-colors"
                  >
                    snugglemind@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-3 bg-muted/60 backdrop-blur-sm p-4 rounded-lg">
                  <Phone className="h-6 w-6 text-primary" />
                  <span className="text-foreground">(02) 456-2545</span>
                </div>
              </div>
            </div>

            <Card className="p-8 bg-muted/80 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-6 text-foreground">
                Send us a message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="bg-background/50"
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="bg-background/50"
                />
                <Input
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="bg-background/50"
                />
                <Input
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  required
                  className="bg-background/50"
                />
                <Textarea
                  placeholder="Write a message..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  required
                  rows={5}
                  className="bg-background/50 resize-none"
                />
                <Button type="submit" className="w-full" size="lg">
                  SEND MESSAGE
                </Button>
              </form>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Contact;
