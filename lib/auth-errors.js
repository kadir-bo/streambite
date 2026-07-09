/**
 * Firebase Auth-Fehlercodes → deutsche Nutzertexte
 */
const ERROR_MAP = {
  /* Login */
  "auth/invalid-credential": "E-Mail oder Passwort falsch.",
  "auth/user-not-found": "Kein Konto mit dieser E-Mail gefunden.",
  "auth/wrong-password": "Falsches Passwort.",
  "auth/too-many-requests": "Zu viele Versuche. Bitte warte kurz.",
  "auth/user-disabled": "Dieses Konto wurde deaktiviert.",
  /* Register */
  "auth/email-already-in-use": "Diese E-Mail wird bereits verwendet.",
  "auth/invalid-email": "Ungültige E-Mail-Adresse.",
  "auth/weak-password": "Passwort zu schwach.",
};

export function getAuthError(code) {
  return ERROR_MAP[code] ?? "Ein Fehler ist aufgetreten. Bitte versuche es erneut.";
}
