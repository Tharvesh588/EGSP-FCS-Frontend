
"use client";

import { useAlert } from '@/context/alert-context';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

export function GlobalAlert() {
  const { isAlertOpen, alertContent, closeAlert } = useAlert();

  return (
    <AlertDialog open={isAlertOpen} onOpenChange={(open) => !open && closeAlert()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{alertContent.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {alertContent.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={closeAlert}>OK</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
