import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Search, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockRecentPatients = [
  { id: "1", name: "Hinako", date: "10/10" },
  { id: "2", name: "Kotoyuki", date: "10/09" },
];

const mockPatientList = [
  { id: "1", name: "Jennifer", time: "8:00", color: "bg-primary/30" },
  { id: "2", name: "Dylan", time: "10:00", color: "bg-secondary/30" },
  { id: "3", name: "Rem", time: "13:07", color: "bg-accent/30" },
  { id: "4", name: "Genaro", time: "14:30", color: "bg-primary/30" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date(2020, 9, 8));
  const [selectedPatient, setSelectedPatient] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handlePatientSelect = (patient: { id: string; name: string }) => {
    setSelectedPatient(patient);
  };

  return (
    <div className="flex min-h-screen w-full">
      <DashboardSidebar selectedPatient={selectedPatient || undefined} />

      <main className="flex-1 bg-background">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
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

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card className="p-6 bg-primary/10">
                <h2 className="text-3xl font-bold mb-2">
                  Welcome back,{" "}
                  <span className="text-primary">&lt;NAME&gt;</span>
                </h2>
                <p className="text-muted-foreground">&lt;Notification message&gt;</p>
              </Card>

              <div>
                <h3 className="text-2xl font-bold mb-4">Recent Patient</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {selectedPatient
                    ? "Below is the most recently pre-assessed patients"
                    : "Will show the 5 recent patients for the month. If none, will say so."}
                </p>
                <div className="space-y-3">
                  {mockRecentPatients.map((patient) => (
                    <Card
                      key={patient.id}
                      className="p-4 bg-accent hover:bg-accent/80 cursor-pointer transition-colors"
                      onClick={() => handlePatientSelect(patient)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {patient.date}
                        </span>
                        <span className="font-semibold text-accent-foreground">
                          {patient.name}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4">Patient List</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {selectedPatient
                    ? "Please select a date in the calendar to view patients"
                    : "If none is selected, the text will say so. If there is no record in the selected date, it will also say so."}
                </p>
                {date && (
                  <>
                    <p className="font-semibold mb-3">
                      Oct {date.getDate()}
                    </p>
                    <div className="space-y-2">
                      {mockPatientList.map((patient) => (
                        <Card
                          key={patient.id}
                          className={`p-3 ${patient.color} hover:opacity-80 cursor-pointer transition-opacity`}
                          onClick={() => handlePatientSelect(patient)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-foreground/70">
                              {patient.time}
                            </span>
                            <span className="font-semibold">
                              {patient.name}
                            </span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div>
              <Card className="p-4 mb-6">
                <div className="text-center mb-4">
                  <div className="text-sm font-semibold text-muted-foreground">
                    Thursday
                  </div>
                  <div className="text-sm text-muted-foreground">Oct 10</div>
                </div>
                <div className="text-5xl font-bold text-center text-primary">
                  10:28
                </div>
              </Card>

              <div>
                <h3 className="text-2xl font-bold mb-4">Calendar</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  &lt;Description about to select a data&gt;
                </p>
                <Card className="p-4">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md"
                  />
                  <p className="text-sm text-muted-foreground mt-4 text-center">
                    &lt;Will say whether how many records are there as of the
                    current day&gt;
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
