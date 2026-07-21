import { CredentialsSignin } from "next-auth";

/** Wrong email/password (also used for unknown accounts — no enumeration). */
export class InvalidCredentials extends CredentialsSignin {
  code = "invalid_credentials";
}

/** Password was correct but a 2FA code is required to finish signing in. */
export class TotpRequired extends CredentialsSignin {
  code = "totp_required";
}

/** The submitted 2FA / backup code was wrong. */
export class TotpInvalid extends CredentialsSignin {
  code = "totp_invalid";
}

/** A passkey / One Tap assertion failed verification. */
export class WebauthnFailed extends CredentialsSignin {
  code = "webauthn_failed";
}
