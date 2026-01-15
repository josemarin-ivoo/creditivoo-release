// Lista de dominios de emails temporales (disposable emails)
const DISPOSABLE_EMAIL_DOMAINS = [
  '10minutemail.com',
  '20minutemail.com',
  '33mail.com',
  'guerrillamail.com',
  'mailinator.com',
  'tempmail.com',
  'throwaway.email',
  'yopmail.com',
  'temp-mail.org',
  'getnada.com',
  'mohmal.com',
  'fakeinbox.com',
  'trashmail.com',
  'mintemail.com',
  'sharklasers.com',
  'grr.la',
  'guerrillamailblock.com',
  'pokemail.net',
  'spam4.me',
  'bccto.me',
  'chitthi.in',
  'dispostable.com',
  'emailondeck.com',
  'fakemailgenerator.com',
  'maildrop.cc',
  'meltmail.com',
  'mohmal.com',
  'mytrashmail.com',
  'putthisinyourspamdatabase.com',
  'spamgourmet.com',
  'spamhole.com',
  'tempail.com',
  'tempe-mail.com',
  'tempinbox.co.uk',
  'tempinbox.com',
  'tempmail.de',
  'tempmail.eu',
  'tempmail.it',
  'tempmail2.com',
  'temporary-mail.net',
  'thrma.com',
  'tmail.ws',
  'toiea.com',
  'trash-amil.com',
  'trashmail.at',
  'trashmail.com',
  'trashmail.me',
  'trashmail.net',
  'trashymail.com',
  'tyldd.com',
  'wh4f.org',
  'willhackforfood.biz',
  'winemaven.info',
  'wronghead.com',
  'wuzup.net',
  'wuzupmail.net',
  'xagena.com',
  'xemaps.com',
  'xents.com',
  'xmaily.com',
  'xoxy.net',
  'yapped.net',
  'yeah.net',
  'yep.it',
  'yogamaven.com',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'youmailr.com',
  'ypmailbyngk.com',
  'zippymail.info',
  'zoemail.org',
  'zoemail.net',
];

// Expresión regular robusta para validar emails
// Basada en RFC 5322 pero simplificada para uso práctico
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Valida un email con las siguientes reglas:
 * 1. Trim del email
 * 2. Expresión regular robusta
 * 3. Bloqueo de emails temporales (opcional)
 */
export const validateEmail = (
  email: string | undefined,
  blockDisposable: boolean = true,
): {isValid: boolean; error?: string} => {
  if (!email) {
    return {isValid: false, error: 'El email es obligatorio'};
  }

  // 1. Trim del email
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    return {isValid: false, error: 'El email es obligatorio'};
  }

  // 2. Validación con expresión regular robusta
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return {isValid: false, error: 'El formato del email no es válido'};
  }

  // Validaciones adicionales
  const parts = trimmedEmail.split('@');
  if (parts.length !== 2) {
    return {isValid: false, error: 'El formato del email no es válido'};
  }

  const [localPart, domain] = parts;

  // Validar parte local (antes del @)
  if (localPart.length === 0 || localPart.length > 64) {
    return {
      isValid: false,
      error: 'La parte local del email no es válida',
    };
  }

  // Validar dominio (después del @)
  if (domain.length === 0 || domain.length > 255) {
    return {
      isValid: false,
      error: 'El dominio del email no es válido',
    };
  }

  // Validar que no tenga puntos consecutivos
  if (trimmedEmail.includes('..')) {
    return {isValid: false, error: 'El email no puede tener puntos consecutivos'};
  }

  // Validar que no empiece o termine con punto
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return {
      isValid: false,
      error: 'El email no puede empezar o terminar con punto',
    };
  }

  // 3. Bloquear emails temporales (opcional)
  if (blockDisposable) {
    const domainLower = domain.toLowerCase();
    if (DISPOSABLE_EMAIL_DOMAINS.includes(domainLower)) {
      return {
        isValid: false,
        error: 'No se permiten correos electrónicos temporales',
      };
    }
  }

  return {isValid: true};
};

/**
 * Normaliza el email (trim y lowercase)
 */
export const normalizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

