import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface EditPatientFormProps {
  patientId: string;
  onSuccess?: () => void; // called after successful update
}

const EditPatientForm: React.FC<EditPatientFormProps> = ({
  patientId,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // 🔹 Load current patient data
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const username = localStorage.getItem("username");
        if (!username) {
          toast.error("No user found. Please log in again.");
          return;
        }

        const res = await fetch(
          `http://localhost:5000/api/patients/${patientId}?ownerUsername=${encodeURIComponent(
            username
          )}`
        );
        const data = await res.json();

        if (!res.ok) {
          console.error("❌ Failed to fetch patient:", data);
          toast.error(data.message || "Failed to load patient details.");
          return;
        }

        setName(data.name || "");
        setAge(data.age?.toString() || "");
        setGender(data.gender || undefined);
      } catch (err) {
        console.error("❌ Error fetching patient:", err);
        toast.error("Something went wrong while loading patient details.");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !age || !gender) {
      toast.error("Please fill in all fields.");
      return;
    }

    const username = localStorage.getItem("username");
    if (!username) {
      toast.error("No user found. Please log in again.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `http://localhost:5000/api/patients/${patientId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            age: Number(age),
            gender,
            ownerUsername: username,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("❌ Failed to update patient:", data);
        toast.error(data.message || "Failed to update patient.");
        return;
      }

      toast.success("Patient updated successfully!");

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("❌ Error updating patient:", err);
      toast.error("Something went wrong while updating the patient.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <p className="text-sm text-muted-foreground">Loading patient...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          placeholder="Enter full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="age">Age</Label>
        <Input
          id="age"
          type="number"
          min={0}
          placeholder="Enter age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1">
        <Label>Gender</Label>
        <Select value={gender} onValueChange={setGender}>
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={loading}
        style={{ fontFamily: '"Alef", sans serif' }}
      >
        {loading ? "Updating..." : "Update Patient"}
      </Button>
    </form>
  );
};

export default EditPatientForm;
