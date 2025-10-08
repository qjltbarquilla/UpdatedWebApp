import { useParams } from "react-router-dom";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const Transcript = () => {
  const { patientId } = useParams();

  return (
    <div className="flex min-h-screen w-full">
      <DashboardSidebar
        selectedPatient={{ id: patientId || "", name: "Hinako" }}
      />

      <main className="flex-1 bg-background">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search" className="pl-10" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <Card className="p-8 min-h-[600px] bg-muted/50">
            <h2 className="text-2xl font-bold mb-6">
              Conversation Transcript - Hinako
            </h2>
            <div className="prose max-w-none text-foreground/80">
              <p className="mb-4">
                This area will display the full transcript of the conversation
                between the child and the AI system. The transcript is captured
                through speech-to-text conversion during the interaction with
                the plush toy attachment.
              </p>
              <div className="bg-background/50 p-6 rounded-lg mt-8">
                <p className="text-sm text-muted-foreground italic">
                  Transcript content will be populated based on user
                  conversation data from the hardware system...
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Transcript;
