
import React, { useEffect, useMemo, useState } from 'react';

import {
  Search,
  ShieldAlert,
  Users,
  Gauge,
  TrendingUp,
  ArrowRight,
  Plus,
  Download,
  Database,
  CheckCircle,
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { ChevronDown, UserRound } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import Sidebar from './components/Sidebar';
import StudentTable from './components/StudentTable';
import StudentDrawer from './components/StudentDrawer';
import AddStudentModal from './components/AddStudentModal';

import {
  DepartmentChart,
  RiskChart,
} from './components/Charts';

import {
  loadStudents,
  saveStudent,
  seedStudents,
} from './services/students';

import { analyze } from './utils/analytics';
import { firebaseConfigured } from './firebase';

import './styles.css';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [raw, setRaw] = useState([]);
  const [selected, setSelected] = useState(null);
  const [staffProfile, setStaffProfile] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  // Search and directory filters
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('All');
  const [year, setYear] = useState('All');
  const [risk, setRisk] = useState('All');
  const [attendanceFilter, setAttendanceFilter] = useState('All');
  const [sortBy, setSortBy] = useState('score-desc');

  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [savingStudent, setSavingStudent] = useState(false);

  // Load students from Firestore through the existing service
  async function reload() {
    setLoading(true);

    try {
      const data = await loadStudents();
      setRaw(data);
    } catch (error) {
      console.error('Firestore load failed:', error);
      setNotice('Could not load students: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (!user || !db) {
      setStaffProfile(null);
      return;
    }

    try {
      const staffRef = doc(db, 'staff', user.uid);
      const staffSnap = await getDoc(staffRef);

      if (staffSnap.exists()) {
        setStaffProfile({
          ...staffSnap.data(),
          email: staffSnap.data().email || user.email || '',
        });
      } else {
        setStaffProfile({
          name: user.displayName || 'Staff member',
          email: user.email || '',
          role: 'staff',
          department: '',
        });
      }
    } catch (error) {
      console.error('Could not load staff profile:', error);
      setStaffProfile({
        name: 'Staff member',
        email: user.email || '',
        role: 'staff',
        department: '',
      });
    }
  });

  return unsubscribe;
}, []);
    
useEffect(() => {
  reload();
}, []);



  // Calculate the analytics for each student
  const students = useMemo(
    () =>
      raw.map(student => ({
        ...student,
        _analysis: analyze(student),
      })),
    [raw]
  );

  const average = students.length
    ? Math.round(
        students.reduce(
          (total, student) => total + student._analysis.score,
          0
        ) / students.length
      )
    : 0;

  const atRisk = students.filter(
    student => student._analysis.risk !== 'Low'
  ).length;

  const averageAttendance = students.length
    ? Math.round(
        students.reduce(
          (total, student) => total + Number(student.attendance || 0),
          0
        ) / students.length
      )
    : 0;

  // Build filter options from actual student records
  const departments = [
    ...new Set(
      students
        .map(student => student.department)
        .filter(Boolean)
    ),
  ].sort();

  const years = [
    ...new Set(
      students
        .map(student => student.year)
        .filter(value => value !== undefined && value !== null && value !== '')
    ),
  ].sort((a, b) => Number(a) - Number(b));

  // Apply all filters, then sort the matching students
  const shown = students
    .filter(student => {
      const searchText =
        `${student.name || ''} ${student.id || ''} ${student.department || ''}`;

      const matchesSearch = searchText
        .toLowerCase()
        .includes(query.trim().toLowerCase());

      const matchesDepartment =
        department === 'All' ||
        student.department === department;

      const matchesYear =
        year === 'All' ||
        String(student.year) === year;

      const matchesRisk =
        risk === 'All' ||
        student._analysis.risk === risk;

      const attendance = Number(student.attendance);

      const matchesAttendance =
        attendanceFilter === 'All' ||
        (
          attendanceFilter === 'below75' &&
          Number.isFinite(attendance) &&
          attendance < 75
        ) ||
        (
          attendanceFilter === '75plus' &&
          Number.isFinite(attendance) &&
          attendance >= 75
        );

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesYear &&
        matchesRisk &&
        matchesAttendance
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'score-asc':
          return a._analysis.score - b._analysis.score;

        case 'score-desc':
          return b._analysis.score - a._analysis.score;

        case 'attendance-asc':
          return Number(a.attendance || 0) -
            Number(b.attendance || 0);

        case 'attendance-desc':
          return Number(b.attendance || 0) -
            Number(a.attendance || 0);

        case 'cgpa-asc': {
          const aCgpa = Number(a.cgpa);
          const bCgpa = Number(b.cgpa);

          if (!Number.isFinite(aCgpa)) return 1;
          if (!Number.isFinite(bCgpa)) return -1;

          return aCgpa - bCgpa;
        }

        case 'cgpa-desc': {
          const aCgpa = Number(a.cgpa);
          const bCgpa = Number(b.cgpa);

          if (!Number.isFinite(aCgpa)) return 1;
          if (!Number.isFinite(bCgpa)) return -1;

          return bCgpa - aCgpa;
        }

        case 'name-asc':
          return String(a.name || '').localeCompare(
            String(b.name || '')
          );

        case 'name-desc':
          return String(b.name || '').localeCompare(
            String(a.name || '')
          );

        default:
          return 0;
      }
    });

  // Open the add-student modal
  function add() {
    setNotice('');
    setShowAddModal(true);
  }

  // Save a student using the existing Firebase service
  async function handleAddStudent(student) {
    if (savingStudent) return;

    setSavingStudent(true);
    setNotice('');

    try {
      const saved = await saveStudent(student);

      setRaw(previous => [...previous, saved]);
      setShowAddModal(false);
      setPage('students');

      setNotice(
        `Student ${student.name} saved successfully.`
      );
    } catch (error) {
      console.error('Failed to save student:', error);

      setNotice(
        error.code === 'permission-denied'
          ? 'Permission denied. Check your Firestore rules.'
          : error.message || 'Could not save student.'
      );
    } finally {
      setSavingStudent(false);
    }
  }

  // Seed demo records through the existing service
  async function seed() {
    try {
      setNotice(await seedStudents());
      await reload();
    } catch (error) {
      setNotice('Could not load demo data: ' + error.message);
    }
  }

  // Export the currently filtered records
  function exportCsv() {
    const escapeCsv = value =>
      `"${String(value ?? '').replace(/"/g, '""')}"`;

    const rows = [
      [
        'ID',
        'Name',
        'Department',
        'Year',
        'CGPA',
        'Attendance',
        'LMS',
        'Engagement',
        'Placement',
        'Backlogs',
        'Success Score',
        'Risk',
      ],
      ...shown.map(student => [
        student.id,
        student.name,
        student.department,
        student.year,
        student.cgpa,
        student.attendance,
        student.lms,
        student.engagement,
        student.placement,
        student.backlogs,
        student._analysis.score,
        student._analysis.risk,
      ]),
    ];

    const csv = rows
      .map(row => row.map(escapeCsv).join(','))
      .join('\r\n');

    const blob = new Blob(
      ['\uFEFF' + csv],
      { type: 'text/csv;charset=utf-8;' }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'campuspulse-students.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function clearFilters() {
    setQuery('');
    setDepartment('All');
    setYear('All');
    setRisk('All');
    setAttendanceFilter('All');
    setSortBy('score-desc');
  }

  return (
    <div className="app">
      <Sidebar page={page} setPage={setPage} />

      <main className="main">
        <header>
          <div className="crumb">
            CampusPulse <span>/</span> {page}
          </div>

          <div className="top-search">
            <Search size={16} />

            <input
              placeholder="Search students..."
              value={query}
              onChange={event => {
                setQuery(event.target.value);
                setPage('students');
              }}
            />
          </div>

          
<div className="staff-profile">
  <button
    className="staff-profile-button"
    onClick={() => setProfileOpen(open => !open)}
    aria-expanded={profileOpen}
  >
    <div className="user-avatar">
      {(staffProfile?.name || 'Staff')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(word => word[0])
        .join('')
        .toUpperCase()}
    </div>

    <div className="staff-profile-summary">
      <strong>{staffProfile?.name || 'Loading profile…'}</strong>
      <small>
        {staffProfile?.role === 'admin'
          ? 'Administrator'
          : staffProfile?.role === 'faculty'
            ? 'Faculty'
            : 'Staff account'}
      </small>
    </div>

    <ChevronDown size={16} />
  </button>

  {profileOpen && (
    <div className="staff-profile-menu">
      <strong>{staffProfile?.name || 'Staff member'}</strong>
      <p>{staffProfile?.email || 'No email available'}</p>

      <p>
        Role: {staffProfile?.role || 'Staff'}
      </p>

      {staffProfile?.department && (
        <p>Department: {staffProfile.department}</p>
      )}
    </div>
  )}
</div>

        </header>

        <section className="content">
          {notice && (
            <div className="notice">
              <CheckCircle size={16} />
              <span>{notice}</span>

              <button onClick={() => setNotice('')}>
                Dismiss
              </button>
            </div>
          )}

          {loading ? (
            <div className="loading">
              Loading student insights…
            </div>
          ) : (
            <>
              {/* DASHBOARD */}
              {page === 'dashboard' && (
                <>
                  <div className="heading">
                    <div>
                      <p className="eyebrow">
                        CAMPUS INTELLIGENCE / OVERVIEW
                      </p>

                      <h1>Student success overview</h1>

                      <p>
                        Turn campus data into timely,
                        supportive action.
                      </p>
                    </div>

                    <span className="demo-tag">
                      ● Student data overview
                    </span>
                  </div>

                  <div className="welcome">
                    <div className="spark">✦</div>

                    <div>
                      <b>Welcome, Staff</b>

                      <p>
                        Review academic, attendance and
                        engagement indicators.
                      </p>
                    </div>

                    <small>
                      DATA-DRIVEN
                      <br />
                      STUDENT SUPPORT
                    </small>
                  </div>

                  <div className="stats">
                    <Stat
                      icon={Users}
                      label="Students tracked"
                      value={students.length}
                      note="Across departments"
                    />

                    <Stat
                      icon={Gauge}
                      label="Average success score"
                      value={`${average}/100`}
                      note="Prototype score formula"
                    />

                    <Stat
                      icon={ShieldAlert}
                      label="Need attention"
                      value={atRisk}
                      note="Medium or high risk flags"
                    />

                    <Stat
                      icon={TrendingUp}
                      label="Average attendance"
                      value={`${averageAttendance}%`}
                      note="Across loaded records"
                    />
                  </div>

                  <div className="grid">
                    <section className="panel">
                      <PanelTitle
                        title="Department performance"
                        sub="Average success score by department"
                      />

                      <DepartmentChart students={students} />
                    </section>

                    <section className="panel">
                      <PanelTitle
                        title="Risk distribution"
                        sub="Based on prototype rules"
                      />

                      <RiskChart students={students} />
                    </section>
                  </div>

                  <section className="panel">
                    <PanelTitle
                      title="Students needing attention"
                      sub="Select a student to review their details"
                    />

                    <StudentTable
                      students={[...students]
                        .sort(
                          (a, b) =>
                            a._analysis.score - b._analysis.score
                        )
                        .slice(0, 7)}
                      onSelect={setSelected}
                    />
                  </section>

                  <p className="disclaimer">
                    Scores and risk flags are prototype indicators,
                    not validated predictions. Use them to support
                    human review rather than as the sole basis for
                    consequential decisions.
                  </p>
                </>
              )}

              {/* STUDENT DIRECTORY */}
              {page === 'students' && (
                <>
                  <div className="heading">
                    <div>
                      <p className="eyebrow">
                        CAMPUS INTELLIGENCE / DIRECTORY
                      </p>

                      <h1>Student directory</h1>

                      <p>
                        Search and manage student academic details.
                      </p>
                    </div>

                    <div className="buttons">
                      <button
                        className="secondary"
                        onClick={exportCsv}
                      >
                        <Download size={15} />
                        Export CSV
                      </button>

                      <button
                        className="primary"
                        onClick={add}
                      >
                        <Plus size={15} />
                        Add student
                      </button>
                    </div>
                  </div>

                  <section className="panel">
                    <div className="filters directory-filters">
                      <b>{shown.length} students</b>

                      <select
                        value={department}
                        onChange={event =>
                          setDepartment(event.target.value)
                        }
                        aria-label="Filter by department"
                      >
                        <option value="All">
                          All departments
                        </option>

                        {departments.map(dept => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>

                      <select
                        value={year}
                        onChange={event =>
                          setYear(event.target.value)
                        }
                        aria-label="Filter by year"
                      >
                        <option value="All">All years</option>

                        {years.map(studentYear => (
                          <option
                            key={studentYear}
                            value={String(studentYear)}
                          >
                            Year {studentYear}
                          </option>
                        ))}
                      </select>

                      <select
                        value={risk}
                        onChange={event =>
                          setRisk(event.target.value)
                        }
                        aria-label="Filter by risk"
                      >
                        <option value="All">All risks</option>
                        <option value="Low">Low risk</option>
                        <option value="Medium">Medium risk</option>
                        <option value="High">High risk</option>
                      </select>

                      <select
                        value={attendanceFilter}
                        onChange={event =>
                          setAttendanceFilter(event.target.value)
                        }
                        aria-label="Filter by attendance"
                      >
                        <option value="All">
                          All attendance
                        </option>
                        <option value="below75">
                          Below 75%
                        </option>
                        <option value="75plus">
                          75% and above
                        </option>
                      </select>

                      <select
                        value={sortBy}
                        onChange={event =>
                          setSortBy(event.target.value)
                        }
                        aria-label="Sort students"
                      >
                        <option value="score-desc">
                          Success: High to Low
                        </option>
                        <option value="score-asc">
                          Success: Low to High
                        </option>
                        <option value="attendance-desc">
                          Attendance: High to Low
                        </option>
                        <option value="attendance-asc">
                          Attendance: Low to High
                        </option>
                        <option value="cgpa-desc">
                          CGPA: High to Low
                        </option>
                        <option value="cgpa-asc">
                          CGPA: Low to High
                        </option>
                        <option value="name-asc">
                          Name: A to Z
                        </option>
                        <option value="name-desc">
                          Name: Z to A
                        </option>
                      </select>

                      <button
                        className="secondary"
                        onClick={clearFilters}
                      >
                        Clear filters
                      </button>
                    </div>

                    <StudentTable
                      students={shown}
                      onSelect={setSelected}
                    />
                  </section>
                </>
              )}

              {/* INTERVENTION PLANNER */}
              {page === 'interventions' && (
                <>
                  <div className="heading">
                    <div>
                      <p className="eyebrow">
                        CAMPUS INTELLIGENCE / SUPPORT
                      </p>

                      <h1>Intervention planner</h1>

                      <p>
                        Review indicators and plan supportive
                        next steps.
                      </p>
                    </div>
                  </div>

                  <div className="welcome">
                    <ShieldAlert />

                    <div>
                      <b>Start with a conversation</b>

                      <p>
                        Risk flags are prompts for faculty review,
                        not conclusions about a student.
                      </p>
                    </div>
                  </div>

                  <div className="interventions">
                    {students
                      .filter(
                        student =>
                          student._analysis.risk !== 'Low'
                      )
                      .sort(
                        (a, b) =>
                          a._analysis.score - b._analysis.score
                      )
                      .map(student => (
                        <button
                          className="intervention"
                          key={student.id}
                          onClick={() => setSelected(student)}
                        >
                          <b>{student.name}</b>

                          <span>
                            {student._analysis.risk} risk ·
                            Score {student._analysis.score}
                          </span>

                          <small>
                            {student._analysis.actions?.[0] ||
                              'Review student progress'}
                          </small>

                          <ArrowRight size={16} />
                        </button>
                      ))}
                  </div>
                </>
              )}

              {/* SETTINGS */}
              {page === 'settings' && (
                <>
                  <div className="heading">
                    <div>
                      <p className="eyebrow">
                        CAMPUS INTELLIGENCE / CONFIGURATION
                      </p>

                      <h1>Setup &amp; data</h1>

                      <p>
                        Firebase configuration and data management.
                      </p>
                    </div>
                  </div>

                  <div className="grid settings-grid">
                    <section className="panel">
                      <Database />

                      <h3>Data source</h3>

                      <p>
                        {firebaseConfigured
                          ? 'Firebase configured. Student records use the Firestore students collection.'
                          : 'Firebase is not configured. Check your .env settings.'}
                      </p>

                      {firebaseConfigured && (
                        <button
                          className="primary"
                          onClick={seed}
                        >
                          Load demo data into Firestore
                        </button>
                      )}
                    </section>

                    <section className="panel">
                      <ShieldAlert />

                      <h3>Responsible use</h3>

                      <p>
                        Use verified student data, Firebase
                        Authentication, staff role-based security
                        rules, and approved privacy controls.
                      </p>
                    </section>

                    <section className="panel">
                      <Gauge />

                      <h3>Score methodology</h3>

                      <p>
                        Academic 35%, attendance 25%, LMS 15%,
                        engagement 10%, placement readiness 15%.
                        This is an illustrative prototype formula.
                      </p>
                    </section>
                  </div>
                </>
              )}
            </>
          )}
        </section>

        <footer>
          CampusPulse AI · Hackathon prototype

          <span>
            {firebaseConfigured
              ? 'Firestore configured'
              : 'Local demo mode'}
          </span>
        </footer>
      </main>

      <StudentDrawer
        student={selected}
        onClose={() => setSelected(null)}
      />

      {showAddModal && (
        <AddStudentModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddStudent}
          saving={savingStudent}
        />
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value, note }) {
  return (
    <div className="stat">
      <div className="stat-icon">
        <Icon size={19} />
      </div>

      <span>{label}</span>
      <b>{value}</b>
      <small>{note}</small>
    </div>
  );
}

function PanelTitle({ title, sub }) {
  return (
    <div className="panel-title">
      <div>
        <h2>{title}</h2>
        <p>{sub}</p>
      </div>
    </div>
  );
}
