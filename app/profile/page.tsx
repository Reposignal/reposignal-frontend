/**
 * Profile Page
 * Shows user identity and editable bio
 * No scores or performance metrics
 */

'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { updateProfile } from '@/lib/api/user';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useRequireAuth } from '@/lib/guards/requireAuth';

export default function ProfilePage() {
  const isAuthenticated = useRequireAuth();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaved(false);
      const updated = await updateProfile({ bio });
      updateUser({ bio: updated.bio });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Profile Header */}
      <div className="mb-8 flex items-center gap-4">
        {user.avatarUrl && (
          <img
            src={user.avatarUrl}
            alt={user.username}
            className="w-20 h-20 rounded-full"
          />
        )}
        <div>
          <h1 className="text-2xl font-semibold text-neutral-100">{user.username}</h1>
          <p className="text-sm text-neutral-500">GitHub User</p>
        </div>
      </div>

      {/* Bio */}
      <div className="border-t border-neutral-900 pt-8">
        <h2 className="text-lg font-medium text-neutral-200 mb-4">Bio</h2>
        <Input
          label=""
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself (optional)"
          className="mb-4"
        />
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
          {saved && (
            <span className="text-sm text-neutral-500">Saved successfully</span>
          )}
        </div>
      </div>

      {/* Context */}
      <div className="border-t border-neutral-900 pt-8 mt-8">
        <h2 className="text-lg font-medium text-neutral-200 mb-4">About Profiles</h2>
        <p className="text-sm text-neutral-500 leading-relaxed">
          Profiles provide identity context only. Reposignal does not track contribution
          metrics, rankings, or performance scores.
        </p>
      </div>
    </div>
  );
}
