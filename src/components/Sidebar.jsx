
import React from 'react';

import {
  Activity,
  LayoutDashboard,
  Users,
  ClipboardList,
  Settings,
  LogOut,
  FlaskConical,
  CalendarCheck,
  GraduationCap,
  FileSpreadsheet,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function Sidebar({ page, setPage }) {
  async function handleLogout() {
    if (!auth) {
      alert('Firebase Authentication is not configured.');
      return;
    }

    if (!window.confirm('Are you sure you want to log out?')) {
      return;
    }

    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Could not log out. Please try again.');
    }
  }

  const navigation = [
    ['dashboard', 'Overview', LayoutDashboard],
    ['students', 'Students', Users],
    ['interventions', 'Interventions', ClipboardList],
    ['settings', 'Setup & data', Settings],
  ];

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="brand">
        <div className="logo">
          <Activity />
        </div>

        <div>
          <b>
            CampusPulse <span>AI</span>
          </b>
          <small>STUDENT INTELLIGENCE</small>
        </div>
      </div>

      {/* Navigation */}
      <p className="label">WORKSPACE</p>

      {navigation.map(([id, label, Icon]) => (
        <button
          key={id}
          type="button"
          className={page === id ? 'nav active' : 'nav'}
          onClick={() => setPage(id)}
        >
          <Icon size={18} />
          {label}
        </button>
      ))}

      {/* Beta / upcoming features */}
      <div className="beta-card">
        <div className="beta-heading">
          <div className="beta-icon">
            <FlaskConical size={17} />
          </div>

          <div>
            <b>CampusPulse Beta</b>
            <small>INITIAL VERSION · V1.0</small>
          </div>
        </div>

        <div className="beta-description">
          Core student insights are available now.
          More academic tracking features are planned.
        </div>

        <div className="beta-divider" />

        <p className="upcoming-title">
          COMING NEXT
        </p>

        <div className="upcoming-feature">
          <CalendarCheck size={16} />
          <span>Subject-wise attendance</span>
          <small>V2</small>
        </div>

        <div className="upcoming-feature">
          <GraduationCap size={16} />
          <span>Subject-wise mid marks</span>
          <small>V2</small>
        </div>

        <div className="upcoming-feature">
          <FileSpreadsheet size={16} />
          <span>Bulk academic import</span>
          <small>V2</small>
        </div>
      </div>

      {/* Staff account */}
      <div className="admin">
        <div>AD</div>

        <span>
          <b>Staff account</b>
          <small>Authorized staff</small>
        </span>

        <ShieldCheck size={16} />
      </div>

      {/* Logout */}
      <button
        type="button"
        className="logout-button"
        onClick={handleLogout}
      >
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </aside>
  );
}
