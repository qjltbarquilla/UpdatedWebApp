//Contact Page

import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { MapPin, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import BackgroundImage from "@/assets/BackgroundImage.jpg";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    // send POST request to backend
    const response = await fetch("http://localhost:5000/api/contact/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (response.ok) {
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } else {
      toast.error(data.message || "Failed to send message.");
    }
  } catch (error) {
    console.error("❌ Error submitting message:", error);
    toast.error("Something went wrong. Please try again later.");
  }
};


  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${BackgroundImage})` }}
      />

      <div className="relative z-10">
        <Header />

        <main className="container pt-32 pb-16">
          <div className="grid md:grid-cols-2 gap-16 max-w-15xl mx-auto justify-items-center">
            <div>
              <h1 className="text-5xl font-bold mb-3 text-primary md:whitespace-nowrap"
                  style={{ fontFamily: "Alef, sans-serif", 
                     fontSize: "75px" }}>
                Get in touch with us
              </h1>
              <p className="text-xl text-primary mb-8"
                  style={{ fontFamily: "Alef, sans-serif", 
                     fontSize: "40px" }}>
                We would love to hear from you
              </p>

              <p className="text-primary mb-8 leading-relaxed"
                  style={{ fontFamily: "Alef, sans-serif", 
                     fontSize: "20px" }}>
                Have questions about SnuggleMind or want to learn more about how
                our system can support mental health screening for children?
                Reach out to us and we'll be happy to help.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-muted/20 p-4 rounded-lg border-primary w-1/2">
                  <MapPin className="h-6 w-6 text-primary" />
                  <span className="font-bold text-primary"
                  style={{ fontFamily: "Alef, sans-serif"}}>
                    Jan lang sa tabi-tabi sa kalye
                  </span>
                </div>
                <div className="flex items-center gap-3 bg-muted/20 p-4 rounded-lg border-primary w-1/2">
                  <Mail className="h-6 w-6 text-primary" />
                  <a
                    href="mailto:snugglemind@gmail.com"
                    className="font-bold text-primary hover:text-primary transition-colors"
                    style={{ fontFamily: "Alef, sans-serif"}}
                  >
                    snugglemind@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-3 bg-muted/20 p-4 rounded-lg border-primary w-1/2">
                  <Phone className="h-6 w-6 text-primary" />
                  <span className="font-bold text-primary"
                  style={{ fontFamily: "Alef, sans-serif"}}
                  >
                    (02) 456-2545</span>
                </div>
              </div>
            </div>

            <Card className="p-8 bg-muted/20 md:mt-20 ml-20 w-[90%]">
              <h2 className="text-2xl font-bold mb-5 text-primary"
              style={{ fontFamily: "Alef, sans-serif"}}
              >
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
                  className="border border-primary bg-transparent"
                  style={{ fontFamily: "Alef, sans-serif"}}
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="border border-primary bg-transparent"
                  style={{ fontFamily: "Alef, sans-serif"}}
                />
                <Input
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="border border-primary bg-transparent"
                  style={{ fontFamily: "Alef, sans-serif"}}
                />
                <Input
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  required
                  className="border border-primary bg-transparent"
                  style={{ fontFamily: "Alef, sans-serif"}}
                />
                <Textarea
                  placeholder="Write a message..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  required
                  rows={5}
                  className="border border-primary bg-transparent resize-none"
                  style={{ fontFamily: "Alef, sans-serif"}}
                />
                <Button type="submit" className="w-full text-primary-foreground font-bold" size="lg"
                        style={{fontFamily: "Alef, sans-serif", fontSize: "16px"}}
                >
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
