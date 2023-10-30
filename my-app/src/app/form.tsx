import React, { useState } from "react";

interface RegistrationFormProps {
  onSubmit: (formData: RegistrationFormData) => void;
}

interface RegistrationFormData {
  name: string;
  email: string;
  isTutor: boolean;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<RegistrationFormData>({
    name: "",
    email: "",
    isTutor: false,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
  
    // Check if the target element is a checkbox
    const isChecked = type === "checkbox" ? (e.target as HTMLInputElement).checked : false;
  
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? isChecked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="name">Name:</label>
      <input
        type="text"
        id="name"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        required
      />
      <label htmlFor="email">Email:</label>
      <input
        type="email"
        id="email"
        name="email"
        value={formData.email}
        onChange={handleInputChange}
        required
      />
      <label htmlFor="isTutor">Are you a tutor?</label>
      <input
        type="checkbox"
        id="isTutor"
        name="isTutor"
        checked={formData.isTutor}
        onChange={handleInputChange}
      />
      <button type="submit">Submit</button>
    </form>
  );
};

export default RegistrationForm;
