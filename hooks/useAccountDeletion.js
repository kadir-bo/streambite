"use client";

import { useState } from "react";
import {
  deleteUserAccount,
  reauthWithPasswordAndDelete,
  ReAuthRequiredError,
  logoutUser,
} from "@/lib";

/**
 * Kapselt den gesamten Account-Lösch-Workflow inkl. Re-Auth-UI-State.
 * Gibt State + Handler zurück, die ProfileSettings nur noch rendern muss.
 */
export function useAccountDeletion(firebaseUser) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [reauthEmail, setReauthEmail] = useState(null);
  const [reauthPassword, setReauthPassword] = useState("");
  const [reauthSaving, setReauthSaving] = useState(false);

  async function handleDeleteAccount() {
    setDeleteError("");
    setDeleting(true);
    try {
      await deleteUserAccount(firebaseUser.uid);
      await logoutUser();
    } catch (err) {
      if (err instanceof ReAuthRequiredError) {
        setReauthEmail(err.email);
        setDeleteOpen(false);
        setDeleting(false);
        return;
      }
      setDeleteError(err?.message || "Fehler beim Löschen des Accounts");
      setDeleting(false);
    }
  }

  async function handleReauthAndDelete() {
    if (!reauthPassword.trim()) return;
    setReauthSaving(true);
    setDeleteError("");
    try {
      await reauthWithPasswordAndDelete(reauthPassword);
      await logoutUser();
    } catch (err) {
      setDeleteError(
        err?.message?.includes("invalid-credential")
          ? "Falsches Passwort. Versuche es erneut."
          : err?.message || "Fehler beim Löschen des Accounts",
      );
      setReauthSaving(false);
    }
  }

  return {
    deleteOpen,
    setDeleteOpen,
    deleting,
    deleteError,
    reauthEmail,
    reauthPassword,
    setReauthPassword,
    reauthSaving,
    handleDeleteAccount,
    handleReauthAndDelete,
  };
}