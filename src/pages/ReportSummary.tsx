import { useParams } from "react-router-dom";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Bell, User, Download, FileText } from "lucide-react";
import { toast } from "sonner";

const ReportSummary = () => {
  const { patientId } = useParams();

  const handleDownloadPDF = () => {
    toast.success("Report downloaded successfully!");
  };

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
              <Button
                onClick={handleDownloadPDF}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <Card className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <FileText className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">
                Pre-Assessment Report Summary
              </h1>
            </div>

            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-bold mb-3 text-primary">
                  Patient Information
                </h2>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">Name:</span> Hinako
                  </div>
                  <div>
                    <span className="font-semibold">Age:</span> 12 years
                  </div>
                  <div>
                    <span className="font-semibold">Assessment Date:</span>{" "}
                    October 10, 2020
                  </div>
                  <div>
                    <span className="font-semibold">Session Duration:</span> 45
                    minutes
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3 text-primary">
                  PHQ-9 Screening Results
                </h2>
                <Card className="p-6 bg-muted/50">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="font-semibold mb-2">Total Score: 14/27</p>
                      <p className="text-sm text-muted-foreground">
                        Severity Level: Moderate Depression
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold mb-2">Assessment Confidence:</p>
                      <p className="text-sm text-muted-foreground">
                        High (Based on comprehensive voice and expression analysis)
                      </p>
                    </div>
                  </div>
                </Card>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3 text-primary">
                  Emotional Analysis Summary
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Analysis based on macroexpression patterns and conversational
                  behavioral markers during the assessment session.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary mt-2"></span>
                    <span>
                      Predominant emotional state: Mixed (35% positive, 25% sad)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary mt-2"></span>
                    <span>
                      Notable anxiety indicators present (15% of session)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary mt-2"></span>
                    <span>
                      Voice analysis shows variations in tone and pace consistent
                      with emotional variability
                    </span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3 text-primary">
                  Key Conversation Themes
                </h2>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-secondary mt-2"></span>
                    <span>Concerns about school performance and peer relationships</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-secondary mt-2"></span>
                    <span>Difficulty concentrating on daily tasks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-secondary mt-2"></span>
                    <span>Changes in sleep patterns and appetite</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3 text-primary">
                  Recommendations
                </h2>
                <Card className="p-6 bg-accent/10 border-accent">
                  <p className="text-sm mb-4">
                    Based on the preliminary screening results, the following
                    actions are recommended:
                  </p>
                  <ol className="space-y-2 text-sm list-decimal list-inside">
                    <li>
                      Follow-up assessment with a qualified mental health
                      professional
                    </li>
                    <li>
                      Consideration for structured clinical interview (e.g.,
                      K-SADS)
                    </li>
                    <li>
                      Parent/caregiver consultation to gather additional
                      developmental history
                    </li>
                    <li>
                      Continued monitoring of symptoms over the next 2-4 weeks
                    </li>
                  </ol>
                </Card>
              </section>

              <section className="border-t pt-6">
                <p className="text-xs text-muted-foreground italic">
                  <strong>Important Note:</strong> This report represents
                  preliminary screening data generated by SnuggleMind's
                  AI-powered assessment system. It is designed to support, not
                  replace, clinical judgment by qualified mental health
                  professionals. Final diagnosis and treatment decisions should be
                  made only after comprehensive evaluation by licensed clinicians.
                </p>
              </section>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ReportSummary;
