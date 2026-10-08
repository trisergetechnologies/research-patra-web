import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import Modal from './Modal';

/**
 * Confirmation with optional text input (e.g. review notes).
 * onConfirm may return a promise; the dialog stays open and shows errors until it resolves.
 */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  danger = false,
  input,
}) {
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const close = () => {
    if (busy) return;
    setValue('');
    setError('');
    onClose();
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onConfirm(value.trim());
      setValue('');
      onClose();
    } catch (err) {
      setError(err?.data?.details?.[0]?.message || err?.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  const invalid = input?.required && value.trim().length < (input.minLength ?? 1);

  return (
    <Modal open={open} onClose={close} title={title} size="sm">
      <form onSubmit={submit} className="space-y-4">
        {message && <p className="text-sm text-muted">{message}</p>}
        {input && (
          <textarea
            className="admin-input min-h-[110px]"
            placeholder={input.placeholder}
            value={value}
            maxLength={input.maxLength ?? 1000}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
          />
        )}
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" className="admin-btn-secondary" onClick={close} disabled={busy}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy || invalid}
            className={danger ? 'admin-btn-primary bg-red-600 hover:bg-red-700' : 'admin-btn-primary'}
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}
