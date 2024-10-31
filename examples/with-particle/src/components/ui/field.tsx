import { ReactNode } from 'react';
import { Label } from './label';
import { cn } from '@/lib/utils';

interface FieldListProps {
  className?: string;
  children?: ReactNode;
}

export function FieldList({ className, children }: FieldListProps) {
  return <div className={cn('space-y-3 mb-4', className)}>{children}</div>;
}

interface FieldProps {
  label?: ReactNode;
  className?: string;
  children?: ReactNode;
  description?: ReactNode;
}

export function Field({ className, label, children, description }: FieldProps) {
  return (
    <div className={cn(className)}>
      <Label>{label}</Label>
      <div className="text-sm">{children}</div>
      {description && <p className="text-muted-foreground text-xs">{description}</p>}
    </div>
  );
}
