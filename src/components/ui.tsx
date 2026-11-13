import React from 'react';

interface ProCardProps {
  children: React.ReactNode;
  className?: string;
  highlighted?: boolean;
  onClick?: () => void;
}

export function ProCard({
  children,
  className = '',
  highlighted = false,
  onClick,
}: ProCardProps) {
  const base =
    'rounded-2xl border transition-colors duration-200 text-start w-full';
  const surface = highlighted
    ? 'bg-[#172038] border-[#C8FF00]/70 shadow-[0_10px_30px_rgba(200,255,0,0.07)]'
    : 'bg-[#11182B] border-[#233052]';

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${base} ${surface} hover:border-[#C8FF00]/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8FF00] cursor-pointer ${className}`}
      >
        {children}
      </button>
    );
  }

  return <div className={`${base} ${surface} ${className}`}>{children}</div>;
}

interface ProPrimaryButtonProps {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function ProPrimaryButton({
  label,
  onClick,
  icon,
  disabled = false,
  className = '',
}: ProPrimaryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`min-h-[48px] w-full rounded-2xl bg-[#C8FF00] px-6 py-3 text-[15px] font-bold text-[#0A0F1E] flex items-center justify-center gap-2 whitespace-nowrap transition-transform duration-150 hover:bg-[#d6ff3d] active:scale-[0.985] disabled:bg-[#172038] disabled:text-[#63708E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8FF00] cursor-pointer ${className}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

interface ProSecondaryButtonProps {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  destructive?: boolean;
  className?: string;
}

export function ProSecondaryButton({
  label,
  onClick,
  icon,
  destructive = false,
  className = '',
}: ProSecondaryButtonProps) {
  const tone = destructive
    ? 'border-[#FF4D6D]/45 text-[#FF4D6D] hover:bg-[#FF4D6D]/10'
    : 'border-[#233052] text-white hover:border-[#C8FF00]/50';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[48px] w-full rounded-2xl bg-[#11182B] border px-6 py-3 text-sm font-semibold flex items-center justify-center gap-2 whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8FF00] cursor-pointer ${tone} ${className}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

interface ProToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}

export function ProToggle({ checked, onChange, label }: ProToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8FF00] cursor-pointer ${
        checked
          ? 'bg-[#C8FF00] border-[#C8FF00]'
          : 'bg-[#172038] border-[#233052]'
      }`}
    >
      <span
        className={`absolute top-1/2 -translate-y-1/2 start-1 inline-block h-6 w-6 rounded-full transition-transform duration-200 ${
          checked
            ? 'ltr:translate-x-6 rtl:-translate-x-6 bg-[#0A0F1E]'
            : 'translate-x-0 bg-[#9AA7C2]'
        }`}
      />
    </button>
  );
}

interface ProSectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function ProSectionHeader({
  title,
  actionLabel,
  onAction,
}: ProSectionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-xs font-bold tracking-[0.04em] uppercase text-[#9AA7C2]">
        {title}
      </h2>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="min-h-[36px] px-2 text-xs font-bold text-[#C8FF00] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

interface ProEmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function ProEmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: ProEmptyStateProps) {
  return (
    <ProCard className="p-8 flex flex-col items-center text-center">
      <div className="h-14 w-14 rounded-2xl bg-[#C8FF00]/12 border border-[#C8FF00]/30 flex items-center justify-center text-[#C8FF00] mb-5">
        {icon}
      </div>
      <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-[#9AA7C2] max-w-sm leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-6 w-full max-w-xs">
          <ProPrimaryButton label={actionLabel} onClick={onAction} />
        </div>
      )}
    </ProCard>
  );
}

interface ProConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ProConfirmDialog({
  open,
  title,
  description,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
}: ProConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-2xl bg-[#11182B] border border-[#233052] p-6 shadow-2xl text-start">
        <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-white">
          {title}
        </h3>
        <p className="mt-2 text-sm text-[#9AA7C2] leading-relaxed">
          {description}
        </p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] px-4 rounded-xl text-sm font-semibold text-[#9AA7C2] hover:text-white cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="min-h-[44px] px-5 rounded-xl bg-[#FF4D6D] text-sm font-bold text-white hover:bg-[#ff6681] cursor-pointer"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
