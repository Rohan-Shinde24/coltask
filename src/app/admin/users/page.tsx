'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { CheckCircle2, Settings2, RotateCcw, Trash2, Ban, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Action Modals State
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [actionModal, setActionModal] = useState<'' | 'ban' | 'role' | 'delete'>('');
  const [banDays, setBanDays] = useState(7);
  const [banReason, setBanReason] = useState('');
  const [selectedRole, setSelectedRole] = useState('user');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/admin/users');
      setUsers(res.data.users);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push('/admin/login');
      }
      setError('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedUser || !actionModal) return;

    try {
      let payload = {};
      if (actionModal === 'ban') {
        payload = { action: 'ban', banDurationInDays: banDays, banReason };
      } else if (actionModal === 'role') {
        payload = { action: 'set_role', role: selectedRole };
      } else if (actionModal === 'delete') {
        payload = { action: 'delete' };
      }

      await axios.patch(`/api/admin/users/${selectedUser.id}`, payload);
      setActionModal('');
      setSelectedUser(null);
      fetchUsers(); // Refresh
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to perform action');
    }
  };

  const handleUnbanOrRestore = async (userId: string, action: 'unban' | 'restore') => {
    try {
      await axios.patch(`/api/admin/users/${userId}`, { action });
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${action} user`);
    }
  };

  if (isLoading) {
    return <div className="min-h-[50vh] flex items-center justify-center"><span className="loading loading-spinner text-primary"></span></div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-base-content/60 mt-1">View, manage roles, and moderate user accounts.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card bg-base-100 shadow-sm border border-base-300">
        <div className="overflow-x-auto">
          <table className="table w-full table-zebra">
            <thead>
              <tr className="bg-base-200/50">
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const isBanned = user.banExpiresAt && new Date(user.banExpiresAt) > new Date();
                const isDeleted = !!user.deletedAt;
                
                return (
                  <tr key={user.id} className="hover:bg-base-200/30 transition-colors">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-neutral text-neutral-content rounded-full w-10">
                            <span>{user.name.charAt(0)}</span>
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">{user.name}</div>
                          <div className="text-sm opacity-60">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-ghost'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      {isDeleted ? (
                        <span className="badge badge-error gap-1"><Trash2 size={12}/> Deleted</span>
                      ) : isBanned ? (
                        <span className="badge badge-warning gap-1"><Ban size={12}/> Banned</span>
                      ) : (
                        <span className="badge badge-success gap-1 text-white"><CheckCircle2 size={12}/> Active</span>
                      )}
                    </td>
                    <td className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="text-right space-x-2">
                      <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-sm btn-ghost m-1"><Settings2 size={16}/></div>
                        <ul tabIndex={0} className="dropdown-content z-1 menu p-2 shadow bg-base-100 rounded-box w-52">
                          <li>
                            <button onClick={() => { setSelectedUser(user); setSelectedRole(user.role); setActionModal('role'); }}>
                              Change Role
                            </button>
                          </li>
                          {isBanned ? (
                            <li><button className="text-success" onClick={() => handleUnbanOrRestore(user.id, 'unban')}>Unban User</button></li>
                          ) : (
                            <li><button className="text-warning" onClick={() => { setSelectedUser(user); setActionModal('ban'); }}>Ban User</button></li>
                          )}
                          
                          {isDeleted ? (
                            <li><button className="text-success" onClick={() => handleUnbanOrRestore(user.id, 'restore')}><RotateCcw size={16}/> Restore</button></li>
                          ) : (
                            <li><button className="text-error" onClick={() => { setSelectedUser(user); setActionModal('delete'); }}><Trash2 size={16}/> Soft Delete</button></li>
                          )}
                        </ul>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modals */}
      <Modal isOpen={!!actionModal} onClose={() => { setActionModal(''); setSelectedUser(null); }} title={actionModal === 'ban' ? 'Ban User' : actionModal === 'role' ? 'Change Role' : 'Delete User'}>
        <div className="space-y-4">
          {actionModal === 'ban' && (
            <>
              <p>Ban <strong>{selectedUser?.name}</strong> temporarily.</p>
              <div className="form-control">
                <label className="label">Ban Duration (Days)</label>
                <input type="number" className="input input-bordered" value={banDays} onChange={e => setBanDays(parseInt(e.target.value))} min={1} />
              </div>
              <div className="form-control">
                <label className="label">Reason (Optional)</label>
                <input type="text" className="input input-bordered" value={banReason} onChange={e => setBanReason(e.target.value)} />
              </div>
            </>
          )}

          {actionModal === 'role' && (
            <>
              <p>Change role for <strong>{selectedUser?.name}</strong>.</p>
              <div className="form-control">
                <label className="label">Select Role</label>
                <select className="select select-bordered" value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </>
          )}

          {actionModal === 'delete' && (
            <div className="alert alert-error">
              <ShieldAlert size={24} />
              <div>
                <h3 className="font-bold">Move to Recycle Bin?</h3>
                <div className="text-sm">User will be blocked from logging in, but data will be retained.</div>
              </div>
            </div>
          )}

          <div className="modal-action">
            <Button variant="ghost" onClick={() => { setActionModal(''); setSelectedUser(null); }}>Cancel</Button>
            <Button variant={actionModal === 'delete' ? 'danger' : 'primary'} onClick={handleAction}>Confirm</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
