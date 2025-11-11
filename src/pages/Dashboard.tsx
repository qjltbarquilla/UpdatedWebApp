// Dashboard.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Bell, User } from "lucide-react";
import timeCardBg from "@/assets/time-card-bg.jpg";
import { Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import EditPatientForm from "@/pages/EditPatientForm";
import { toast } from "sonner";

type RecentPatient = { id: string; name: string; date: string };

type PatientByDate = Record<
  string,
  { id: string; name: string; time: string; color: string }[]
>;

const keyFor = (d?: Date) =>
  d
    ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`
    : "";

/** Smooth fade at the bottom when content overflows */
const FadeScroll = ({
  maxHeight,
  children,
}: {
  maxHeight: number;
  children: React.ReactNode;
}) => (
  <div className="relative">
    <div className="overflow-y-auto pr-1" style={{ maxHeight }}>
      {children}
    </div>
    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-b from-transparent to-background" />
  </div>
);

/* ---------------- component ---------------- */

const Dashboard = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedPatient, setSelectedPatient] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [time, setTime] = useState<string>("");
  const [username, setUsername] = useState<string>("");

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);

  const [recentPatients, setRecentPatients] = useState<RecentPatient[]>([]);
  const [patientsByDate, setPatientsByDate] = useState<PatientByDate>({});

  const fetchPatients = async () => {
    try {
      const usernameFromStorage = localStorage.getItem("username");
      if (!usernameFromStorage) {
        console.error("No username in localStorage; cannot fetch patients.");
        return;
      }

      const res = await fetch(
        `http://localhost:5000/api/patients?ownerUsername=${encodeURIComponent(
          usernameFromStorage
        )}`
      );

      const data = await res.json();
      console.log("📥 Patients response:", data);

      if (!Array.isArray(data)) {
        console.error("Unexpected patients response:", data);
        return;
      }

      // Sort newest first
      data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Recent patients = top 3
      const recent: RecentPatient[] = data.slice(0, 3).map((p: any) => ({
        id: p._id,
        name: p.name,
        date: p.createdAt,
      }));

      // Group by date for Patient List
      const grouped: PatientByDate = {};
      const colors = ["bg-primary/30", "bg-secondary/30", "bg-accent/30"];

      data.forEach((p: any, index: number) => {
        const created = new Date(p.createdAt);
        const key = keyFor(created); // "YYYY-MM-DD"
        const time = created.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const color = colors[index % colors.length];

        if (!grouped[key]) grouped[key] = [];
        grouped[key].push({
          id: p._id,
          name: p.name,
          time,
          color,
        });
      });

      setRecentPatients(recent);
      setPatientsByDate(grouped);
    } catch (err) {
      console.error("❌ Failed to fetch patients:", err);
    }
  };

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const opts: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Manila",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      };
      setTime(now.toLocaleTimeString("en-US", opts));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const u = localStorage.getItem("username");
    if (u) setUsername(u);
    else navigate("/login");
  }, [navigate]);

  useEffect(() => {
    fetchPatients();
  }, []);

  const handlePatientAdded = () => {
    fetchPatients();
  };

  const handleDeletePatient = async (id: string) => {
    try {
      const usernameFromStorage = localStorage.getItem("username");
      if (!usernameFromStorage) {
        console.error("No username in localStorage; cannot delete patient.");
        toast.error("No user found. Please log in again.");
        return;
      }

      const res = await fetch(
        `http://localhost:5000/api/patients/${id}?ownerUsername=${encodeURIComponent(
          usernameFromStorage
        )}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("❌ Failed to delete patient:", data);
        toast.error(data.message || "Failed to delete patient.");
        return;
      }

          toast.success("Patient deleted successfully.");

    // 🔥 Always clear the sidebar selection after any delete
    setSelectedPatient(null);

    // Refresh lists after delete
    fetchPatients();

    } catch (err) {
      console.error("❌ Error deleting patient:", err);
      toast.error("Something went wrong while deleting the patient.");
    }
  };

  // ⬇️ BACK TO ORIGINAL: only set selectedPatient, no navigation
  const handlePatientSelect = (p: { id: string; name: string }) => {
    setSelectedPatient(p);
  };

  const handleNotificationClick = () => {
    setShowNotifications(true);
    setTimeout(() => setShowNotifications(false), 2000);
  };
  const handleUserIconClick = () => {
    setShowUserInfo(true);
    setTimeout(() => setShowUserInfo(false), 2000);
  };

  const selectedKey = keyFor(date);
  const patientsForDay = patientsByDate[selectedKey] ?? [];

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar
        selectedPatient={selectedPatient || undefined}
        onPatientAdded={handlePatientAdded}
      />

      <main className="flex-1 bg-dashboard w-full">
        <div className="p-4 md:p-8">
          {/* Top bar */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary/50" />
                <Input
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 text-primary/50 rounded-full bg-sidebar/20"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                className="p-2 bg-transparent text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={handleNotificationClick}
              >
                <Bell className="h-6 w-6" />
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  className="p-2 bg-transparent text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={handleUserIconClick}
                >
                  <User className="h-6 w-6" />
                </Button>
                <span className="text-primary font-regular">{username}</span>
              </div>
            </div>
          </div>

          {/* Popovers */}
          {showNotifications && (
            <div className="absolute top-14 left-0 right-0 border border-primary bg-transparent text-primary p-2 rounded-md shadow-md max-w-sm mx-auto">
              <p className="font-bold text-sm">You have 3 new notifications</p>
            </div>
          )}
          {showUserInfo && (
            <div className="absolute top-14 left-0 right-0 border border-primary bg-transparent text-primary p-3 rounded-md shadow-md max-w-sm mx-auto">
              <div className="flex items-center gap-4">
                <User className="h-8 w-8 text-primary" />
                <span className="font-bold">{username}</span>
              </div>
              <p className="text-sm">Welcome to your dashboard!</p>
            </div>
          )}

          <div className="grid lg:grid-cols-4 gap-8">
            {/* LEFT */}
            <div className="lg:col-span-2 space-y-8">
              {/* Welcome */}
              <Card className="p-12 bg-sidebar/50 rounded-2xl shadow-sm border-none">
                <h2
                  className="text-5xl font-bold mb-4 text-primary"
                  style={{ fontFamily: "Alef, sans serif", fontSize: "50px" }}
                >
                  Welcome back, <span className="text-primary">{username}</span>
                </h2>
                <p
                  className="text-primary/80"
                  style={{ fontFamily: "Alef, sans serif", fontSize: "20px" }}
                >
                  This is your dashboard 🥰
                </p>
              </Card>

              {/* Recent Patient — exactly 3, no scroll */}
              <div>
                <h3
                  className="text-3xl font-bold mb-4 text-primary"
                  style={{ fontFamily: "Alef, sans serif" }}
                >
                  Recent Patient
                </h3>
                <p
                  className="text-sm text-primary/50 mb-4"
                  style={{ fontFamily: "Alef, sans serif", fontSize: "16px" }}
                >
                  Below is the most recently pre-assessed patients. Select a
                  patient to view more details.
                </p>

                <div className="space-y-3">
                  {recentPatients.slice(0, 3).map((p) => (
                    <Card
                      key={p.id}
                      className="p-4 bg-accent hover:bg-accent/80 cursor-pointer transition-colors"
                      onClick={() =>
                        handlePatientSelect({ id: p.id, name: p.name })
                      }
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-col">
                          <span className="font-semibold text-accent-foreground">
                            {new Date(p.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <span className="font-semibold text-accent-foreground">
                            {p.name}
                          </span>
                        </div>

                        {/* Delete button with confirmation */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-accent-foreground hover:text-red-600 hover:bg-accent/60"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete patient?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently remove{" "}
                                <span className="font-semibold">{p.name}</span>{" "}
                                from the patient list.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => handleDeletePatient(p.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </Card>
                  ))}

                  {recentPatients.length === 0 && (
                    <Card className="p-4 bg-muted/30">
                      <p className="text-sm text-muted-foreground">
                        No recent patients to show.
                      </p>
                    </Card>
                  )}
                </div>
              </div>

              {/* Patient List — 3 visible, then scroll with soft fade; empty state on no data */}
              <div>
                <h3
                  className="text-3xl text-primary font-bold mb-4"
                  style={{ fontFamily: "Alef, sans serif" }}
                >
                  Patient List
                </h3>
                <p
                  className="text-sm text-primary/50 mb-4"
                  style={{ fontFamily: "Alef, sans serif", fontSize: "16px" }}
                >
                  Please select a date in the calendar to view patients
                </p>

                {date && (
                  <>
                    <p className="font-semibold mb-3">
                      {new Date(date).toLocaleDateString("en-US", {
                        month: "short",
                      })}{" "}
                      {date.getDate()}
                    </p>

                    {patientsForDay.length === 0 ? (
                      <Card className="p-4 bg-muted/30">
                        <p className="text-sm text-muted-foreground">
                          No patients on this day — click a new date.
                        </p>
                      </Card>
                    ) : (
                      <FadeScroll maxHeight={230}>
                        <div className="space-y-2">
                          {patientsForDay.map((p) => (
                            <Card
                              key={p.id}
                              className={`p-3 ${p.color} hover:opacity-80 cursor-pointer transition-opacity`}
                              onClick={() =>
                                handlePatientSelect({ id: p.id, name: p.name })
                              }
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-sm text-primary">
                                    {p.time}
                                  </span>
                                  <span className="font-semibold">
                                    {p.name}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1">
                                  {/* ✏️ Edit patient */}
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 p-0 text-primary hover:text-primary/80 hover:bg-transparent"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>

                                    <DialogContent className="bg-primary-foreground border-4 border-black rounded-2xl shadow-lg text-primary">
                                      <DialogHeader>
                                        <DialogTitle>Edit patient</DialogTitle>
                                        <DialogDescription>
                                          Update this patient&apos;s
                                          information. The original creation
                                          date will stay the same.
                                        </DialogDescription>
                                      </DialogHeader>

                                      <EditPatientForm
                                        patientId={p.id}
                                        onSuccess={() => {
                                          fetchPatients();
                                        }}
                                      />
                                    </DialogContent>
                                  </Dialog>

                                  {/* 🗑️ Delete */}
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-primary hover:text-red-600 hover:bg-white/40"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          Delete patient?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This action cannot be undone. This will
                                          permanently remove{" "}
                                          <span className="font-semibold">
                                            {p.name}
                                          </span>{" "}
                                          from the patient list.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          className="bg-red-600 hover:bg-red-700"
                                          onClick={() =>
                                            handleDeletePatient(p.id)
                                          }
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </FadeScroll>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* RIGHT */}
            <div>
              <div className="flex items-center gap-6 mb-6">
                {/* Time Card */}
                <Card
                  className="bg-sidebar rounded-2xl shadow-sm border-none text-center flex flex-col justify-center items-center"
                  style={{
                    width: "510px",
                    maxWidth: "510px",
                    height: "195px",
                    minHeight: "195px",
                    maxHeight: "195px",
                    padding: "0",
                  }}
                >
                  <div
                    className="flex flex-col justify-center items-center w-full h-full"
                    style={{
                      width: "410px",
                      height: "200px",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      className="text-sm text-primary-foreground"
                      style={{
                        fontFamily: "Alef, sans serif",
                        fontSize: "16px",
                      }}
                    >
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        timeZone: "Asia/Manila",
                      })}
                    </div>
                    <div
                      className="text-sm text-primary-foreground mb-2"
                      style={{
                        fontFamily: "Alef, sans serif",
                        fontSize: "16px",
                      }}
                    >
                      {new Date().toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        timeZone: "Asia/Manila",
                      })}
                    </div>
                    <div
                      className="text-5xl font-bold text-primary-foreground"
                      style={{
                        fontFamily: "Alef, sans serif",
                        fontSize: "50px",
                        width: "220px",
                        minHeight: "60px",
                        letterSpacing: "2px",
                        display: "inline-block",
                      }}
                    >
                      {time}
                    </div>
                    <div
                      className="text-sm text-primary-foreground mt-2"
                      style={{
                        fontFamily: "Alef, sans serif",
                        fontSize: "16px",
                      }}
                    >
                      Asia/Manila Time
                    </div>
                  </div>
                </Card>

                {/* Image beside time card */}
                <img
                  src={timeCardBg}
                  alt="Description"
                  className="rounded-2xl object-cover"
                  style={{
                    width: "400px",
                    height: "195px",
                    maxWidth: "400px",
                    maxHeight: "195px",
                  }}
                />
              </div>

              {/* Calendar */}
              <div className="mt-6">
                <h3
                  className="text-primary text-3xl font-bold mb-4"
                  style={{ fontFamily: "Alef, sans serif" }}
                >
                  Calendar
                </h3>

                <p
                  className="text-sm text-primary/50 mb-4"
                  style={{ fontFamily: "Alef, sans serif", fontSize: "16px" }}
                >
                  This is your calendar.
                </p>

                <Card
                  className="px-19 pt-4 pb-3 flex flex-col items-center justify-start rounded-2xl shadow-sm border-none bg-sidebar/20 mt-18 overflow-hidden"
                  style={{ width: "775px", maxWidth: "775px", height: "515px" }}
                >
                  <div className="flex-grow flex justify-center items-start w-full h-full">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="calendar-fill rounded-md origin-top w-full max-w-[680px] text-lg"
                    />
                  </div>

                  <p className="text-sm text-muted-foreground mt-4 text-center"></p>
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
