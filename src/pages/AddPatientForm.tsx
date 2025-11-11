// src/components/AddPatientForm.tsx

import React, { useState } from "react";
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

interface AddPatientFormProps {
  // optional: used so the sidebar can close the dialog after success
  onSuccess?: () => void;
}

const AddPatientForm: React.FC<AddPatientFormProps> = ({ onSuccess }) => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

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

    const response = await fetch("http://localhost:5000/api/patients/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        age: Number(age),
        gender,
        ownerUsername: username,   // 👈 THIS
      }),
    });

    const data = await response.json();

    if (response.ok) {
      toast.success("Patient added successfully!");
      setName("");
      setAge("");
      setGender(undefined);
      onSuccess?.(); // this triggers fetchPatients() in Dashboard
    } else {
      toast.error(data.message || "Failed to add patient.");
      console.error("❌ Add patient failed:", data);
    }
  } catch (error) {
    console.error("❌ Error adding patient:", error);
    toast.error("Something went wrong. Please try again later.");
  } finally {
    setLoading(false);
  }
};


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
        {loading ? "Adding..." : "Add Patient"}
      </Button>
    </form>
  );
};

export default AddPatientForm;
