import React, { useState, useEffect } from 'react';
import { User, FormDataRecord } from './types/index.js';
import { Navbar } from './components/Navbar.js';
import { LoginView } from './components/LoginView.js';
import { DashboardView } from './components/DashboardView.js';
import { FormsListView } from './components/FormsListView.js';
import { FormWizard } from './components/FormWizard.js';
import { UserManagementView } from './components/UserManagementView.js';
import { SettingsView } from './components/SettingsView.js';

export default function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('btn_token'));
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('btn_user');
    return raw ? JSON.parse(raw) : null;
  });

  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [forms, setForms] = useState<FormDataRecord[]>([]);
  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const [isLoadingForms, setIsLoadingForms] = useState(false);

  // Check auth and fetch current user
  useEffect(() => {
    if (!token) return;

    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
          localStorage.setItem('btn_user', JSON.stringify(data.user));
        } else {
          handleLogout();
        }
      })
      .catch(() => {
        // Fallback keep stored user
      });
  }, [token]);

  const fetchForms = async () => {
    if (!token) return;
    setIsLoadingForms(true);
    try {
      const res = await fetch('/api/forms', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.forms) {
        setForms(data.forms);
      }
    } catch (err) {
      console.error('Failed to fetch forms:', err);
    } finally {
      setIsLoadingForms(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchForms();
    }
  }, [token]);

  const handleLoginSuccess = (newToken: string, user: User) => {
    setToken(newToken);
    setCurrentUser(user);
    localStorage.setItem('btn_token', newToken);
    localStorage.setItem('btn_user', JSON.stringify(user));
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('btn_token');
    localStorage.removeItem('btn_user');
    setCurrentView('dashboard');
  };

  const handleSaveDraft = async (formData: Partial<FormDataRecord>) => {
    if (!token) return;
    try {
      let res;
      if (formData.id) {
        res = await fetch(`/api/forms/${formData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
      } else {
        res = await fetch('/api/forms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
      }
      const data = await res.json();
      await fetchForms();
      return data.form;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleSubmitForm = async (formData: Partial<FormDataRecord>) => {
    if (!token) return;
    try {
      // 1. Save changes first
      let formId = formData.id;
      if (formId) {
        await fetch(`/api/forms/${formId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
      } else {
        const createRes = await fetch('/api/forms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
        const createData = await createRes.json();
        formId = createData.form.id;
      }

      // 2. Submit form
      const submitRes = await fetch(`/api/forms/${formId}/submit`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const submitData = await submitRes.json();
      if (submitData.error) {
        alert(submitData.error);
        return;
      }

      alert('Formulir berhasil disubmit ke Manajemen BTN! Notifikasi WhatsApp telah dikirimkan.');
      await fetchForms();
      setCurrentView('forms');
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // If not logged in, show Login view
  if (!token || !currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  const editingForm = editingFormId ? forms.find((f) => f.id === editingFormId) : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar
        currentUser={currentUser}
        currentView={currentView}
        onNavigate={(view) => {
          setEditingFormId(null);
          setCurrentView(view);
        }}
        onLogout={handleLogout}
      />

      <main className="flex-1 pb-16">
        {currentView === 'dashboard' && (
          <DashboardView
            forms={forms}
            currentUser={currentUser}
            onNavigate={(view, formId) => {
              if (formId) setEditingFormId(formId);
              setCurrentView(view);
            }}
          />
        )}

        {currentView === 'forms' && (
          <FormsListView
            forms={forms}
            currentUser={currentUser}
            token={token}
            onRefresh={fetchForms}
            onNavigateCreate={() => {
              setEditingFormId(null);
              setCurrentView('create-form');
            }}
            onNavigateEdit={(formId) => {
              setEditingFormId(formId);
              setCurrentView('edit-form');
            }}
          />
        )}

        {currentView === 'create-form' && (
          <FormWizard
            initialForm={null}
            currentUser={currentUser}
            onSaveDraft={handleSaveDraft}
            onSubmitForm={handleSubmitForm}
            onCancel={() => setCurrentView('forms')}
          />
        )}

        {currentView === 'edit-form' && (
          <FormWizard
            initialForm={editingForm}
            currentUser={currentUser}
            onSaveDraft={handleSaveDraft}
            onSubmitForm={handleSubmitForm}
            onCancel={() => setCurrentView('forms')}
          />
        )}

        {currentView === 'users' && currentUser.role === 'superadmin' && (
          <UserManagementView token={token} />
        )}

        {currentView === 'settings' && currentUser.role === 'superadmin' && (
          <SettingsView token={token} />
        )}
      </main>

      <footer className="no-print bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        PT. Bank Tabungan Negara (Persero) Tbk &bull; Sistem Formulir Dokumentasi Aset Proyek TI &bull; Standard Dokumen 1:1
      </footer>
    </div>
  );
}
