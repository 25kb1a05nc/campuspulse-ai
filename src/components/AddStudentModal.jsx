
import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';

const initialForm = {
  id: '',
  name: '',
  department: '',
  year: '',
  cgpa: '',
  attendance: '',
  lms: '',
  engagement: '',
  placement: '',
  backlogs: '',
  trend: 'stable',
};

export default function AddStudentModal({ onClose, onSave, saving }) {
  const [form, setForm] = useState(initialForm);

  function update(e) {
    const { name, value } = e.target;
    setForm(previous => ({ ...previous, [name]: value }));
  }

  async function submit(e) {
    e.preventDefault();

    const student = {
      id: form.id.trim(),
      name: form.name.trim(),
      department: form.department,
      year: Number(form.year),
      cgpa: Number(form.cgpa),
      attendance: Number(form.attendance),
      lms: Number(form.lms),
      engagement: Number(form.engagement),
      placement: Number(form.placement),
      backlogs: Number(form.backlogs),
      trend: form.trend,
    };

    if (
      !student.id ||
      !student.name ||
      !student.department ||
      !student.year ||
      !Number.isFinite(student.cgpa) ||
      student.cgpa < 0 ||
      student.cgpa > 10 ||
      !Number.isFinite(student.attendance) ||
      student.attendance < 0 ||
      student.attendance > 100 ||
      !Number.isFinite(student.lms) ||
      student.lms < 0 ||
      student.lms > 100 ||
      !Number.isFinite(student.engagement) ||
      student.engagement < 0 ||
      student.engagement > 100 ||
      !Number.isFinite(student.placement) ||
      student.placement < 0 ||
      student.placement > 100 ||
      !Number.isInteger(student.backlogs) ||
      student.backlogs < 0
    ) {
      alert('Please enter valid values in all fields.');
      return;
    }

    await onSave(student);
  }

  const fields = [
    {
      name: 'id',
      label: 'Student ID / Roll Number',
      type: 'text',
      placeholder: 'e.g. STU-1001',
    },
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      placeholder: 'Enter student name',
    },
    {
      name: 'cgpa',
      label: 'CGPA (0–10)',
      type: 'number',
      min: 0,
      max: 10,
      step: 0.01,
    },
    {
      name: 'attendance',
      label: 'Attendance (%)',
      type: 'number',
      min: 0,
      max: 100,
    },
    {
      name: 'lms',
      label: 'LMS / Assignment Completion (%)',
      type: 'number',
      min: 0,
      max: 100,
    },
    {
      name: 'engagement',
      label: 'Engagement (%)',
      type: 'number',
      min: 0,
      max: 100,
    },
    {
      name: 'placement',
      label: 'Placement Readiness (%)',
      type: 'number',
      min: 0,
      max: 100,
    },
    {
      name: 'backlogs',
      label: 'Number of Backlogs',
      type: 'number',
      min: 0,
      step: 1,
    },
  ];

  return (
    <div className="student-modal-overlay">
      <section
        className="student-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-student-title"
      >
        <header className="student-modal-header">
          <div>
            <div className="student-modal-icon">
              <UserPlus size={22} />
            </div>
            <h2 id="add-student-title">Add Student</h2>
            <p>Enter academic and engagement details.</p>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </header>

        <form onSubmit={submit}>
          <div className="student-form-grid">
            {fields.map(field => (
              <label
                key={field.name}
                className="student-form-field"
              >
                <span>{field.label}</span>
                <input
                  {...field}
                  required
                  name={field.name}
                  value={form[field.name]}
                  onChange={update}
                  disabled={saving}
                />
              </label>
            ))}

            <label className="student-form-field">
              <span>Department</span>
              <select
                name="department"
                value={form.department}
                onChange={update}
                required
                disabled={saving}
              >
                <option value="">Select department</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="IT">IT</option>
                <option value="MECH">Mechanical</option>
                <option value="CIVIL">Civil</option>
                <option value="EEE">EEE</option>
              </select>
            </label>

            <label className="student-form-field">
              <span>Academic Year</span>
              <select
                name="year"
                value={form.year}
                onChange={update}
                required
                disabled={saving}
              >
                <option value="">Select year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </label>

            <label className="student-form-field">
              <span>Performance Trend</span>
              <select
                name="trend"
                value={form.trend}
                onChange={update}
                disabled={saving}
              >
                <option value="up">Improving</option>
                <option value="stable">Stable</option>
                <option value="down">Declining</option>
              </select>
            </label>
          </div>

          <p className="student-form-help">
            Enter verified values. Percentages must be between
            0 and 100; CGPA must be between 0 and 10.
          </p>

          <div className="student-modal-actions">
            <button
              type="button"
              className="secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Student'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
