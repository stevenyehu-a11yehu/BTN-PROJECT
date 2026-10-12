import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.js';
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Search,
  KeyRound,
  X,
  Building,
  Phone,
} from 'lucide-react';

interface UserManagementProps {
  token: string;
}

export const UserManagementView: React.FC<UserManagementProps> = ({ token }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form fields
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('vendor');
  const [formFullName, setFormFullName] = useState('');
  const [formCompanyOrPosition, setFormCompanyOrPosition] = useState('');
  const [formWhatsappNumber, setFormWhatsappNumber] = useState('');
  const [formAssignedSlot, setFormAssignedSlot] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [phoneError, setPhoneError] = useState('');

  const slotOptions = [
    'IT Project Manager BTN',
    'IT Quality Assurance',
    'Technology Architecture Specialist',
    'IT Asset Compliance & CMDB Specialist',
    'Department Head of IT Project Management',
    'Department Head of IT Quality Assurance',
    'Department Head of Enterprise Architecture & Innovation',
    'Department Head of IT Asset Management',
    'IT Project Manager Vendor',
  ];

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const validatePhone = (val: string) => {
    const clean = val.trim();
    if (!clean) {
      setPhoneError('Nomor WhatsApp wajib diisi');
      return false;
    }
    if (!/^08\d{8,11}$/.test(clean)) {
      setPhoneError('Wajib format 08xxxxxxxxxx (10-13 digit angka diawali 08, tanpa +62)');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormUsername('');
    setFormPassword('');
    setFormRole('vendor');
    setFormFullName('');
    setFormCompanyOrPosition('');
    setFormWhatsappNumber('');
    setFormAssignedSlot('');
    setFormIsActive(true);
    setPhoneError('');
    setModalOpen(true);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setFormUsername(u.username);
    setFormPassword('');
    setFormRole(u.role);
    setFormFullName(u.fullName);
    setFormCompanyOrPosition(u.companyOrPosition);
    setFormWhatsappNumber(u.whatsappNumber);
    setFormAssignedSlot(u.assignedSlot || '');
    setFormIsActive(u.isActive);
    setPhoneError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhone(formWhatsappNumber)) return;

    if (!formUsername || !formFullName) {
      alert('Username dan Nama Lengkap wajib diisi.');
      return;
    }

    if (!editingUser && !formPassword) {
      alert('Password awal wajib diisi untuk pengguna baru.');
      return;
    }

    try {
      if (editingUser) {
        // Update user
        const res = await fetch(`/api/users/${editingUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fullName: formFullName,
            companyOrPosition: formCompanyOrPosition,
            whatsappNumber: formWhatsappNumber,
            role: formRole,
            assignedSlot: formAssignedSlot,
            isActive: formIsActive,
            ...(formPassword ? { password: formPassword } : {}),
          }),
        });
        const data = await res.json();
        if (data.error) {
          alert(data.error);
          return;
        }
      } else {
        // Create user
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: formUsername,
            password: formPassword,
            role: formRole,
            fullName: formFullName,
            companyOrPosition: formCompanyOrPosition,
            whatsappNumber: formWhatsappNumber,
            assignedSlot: formAssignedSlot,
          }),
        });
        const data = await res.json();
        if (data.error) {
          alert(data.error);
          return;
        }
      }

      setModalOpen(false);
      await fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menyimpan user.');
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Hapus pengguna "${user.fullName}" (${user.username})?`)) return;

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      await fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus user.');
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.companyOrPosition.toLowerCase().includes(q) ||
      u.whatsappNumber.includes(q) ||
      u.role.includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Card */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
              SUPERADMIN AREA
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mt-1">Manajemen Pengguna & Hak Akses</h2>
          <p className="text-xs text-slate-500">
            Kelola akun Vendor, Manajemen BTN, dan Superadmin beserta nomor WhatsApp Fonnte
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#004C97] hover:bg-[#00366B] text-white font-bold text-sm rounded-xl shadow-xs transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Tambah Pengguna Baru
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari berdasarkan nama, username, instansi, atau nomor WhatsApp..."
          className="w-full text-sm outline-hidden font-medium"
        />
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-4">Pengguna</th>
                <th className="p-4">Role</th>
                <th className="p-4">Perusahaan / Jabatan</th>
                <th className="p-4">Slot Penandatangan</th>
                <th className="p-4">Nomor WhatsApp</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-slate-800 text-sm">{u.fullName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">@{u.username}</div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'superadmin'
                          ? 'bg-purple-100 text-purple-800'
                          : u.role === 'manajemen_btn'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 font-medium">
                    {u.companyOrPosition || '-'}
                  </td>
                  <td className="p-4">
                    {u.assignedSlot ? (
                      <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {u.assignedSlot}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">-</span>
                    )}
                  </td>
                  <td className="p-4 font-mono font-medium text-slate-700">
                    {u.whatsappNumber}
                  </td>
                  <td className="p-4">
                    {u.isActive ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                        <CheckCircle className="w-3.5 h-3.5" /> Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-600 font-semibold">
                        <XCircle className="w-3.5 h-3.5" /> Nonaktif
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-1">
                    <button
                      onClick={() => openEditModal(u)}
                      title="Edit Pengguna"
                      className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(u)}
                      title="Hapus Pengguna"
                      className="p-1.5 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit User */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 text-base">
                {editingUser ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formUsername}
                    disabled={!!editingUser}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="contoh: vendor_pt_wide"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium disabled:bg-slate-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
                  >
                    <option value="vendor">Vendor</option>
                    <option value="manajemen_btn">Manajemen BTN</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  placeholder="Natasya Julianti"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Perusahaan / Jabatan
                </label>
                <input
                  type="text"
                  value={formCompanyOrPosition}
                  onChange={(e) => setFormCompanyOrPosition(e.target.value)}
                  placeholder="PT. Wide Technologies Indonesia / IT Project Manager"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Nomor WhatsApp (Fonnte) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formWhatsappNumber}
                  onChange={(e) => {
                    setFormWhatsappNumber(e.target.value);
                    validatePhone(e.target.value);
                  }}
                  placeholder="08974847052"
                  className={`w-full px-3 py-2 border rounded-lg text-xs font-mono font-medium ${
                    phoneError ? 'border-red-500 bg-red-50' : 'border-slate-300'
                  }`}
                  required
                />
                {phoneError ? (
                  <p className="text-[11px] text-red-600 mt-1 font-semibold">{phoneError}</p>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-1 italic">
                    Format wajib 08xxxxxxxxxx (10-13 digit angka, diawali 08, tanpa +62)
                  </p>
                )}
              </div>

              {formRole === 'manajemen_btn' && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Slot Penandatangan Terkait (Manajemen BTN)
                  </label>
                  <select
                    value={formAssignedSlot}
                    onChange={(e) => setFormAssignedSlot(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
                  >
                    <option value="">-- Pilih Slot Default --</option>
                    {slotOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {editingUser ? 'Ganti Password (Kosongkan jika tidak diubah)' : 'Password Awal'}
                </label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder={editingUser ? '••••••••' : 'Password aman'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
                />
              </div>

              {editingUser && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="user-is-active"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <label htmlFor="user-is-active" className="text-slate-700 font-semibold">
                    Akun Pengguna Aktif
                  </label>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#004C97] hover:bg-[#00366B] text-white font-bold rounded-lg shadow-xs"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
