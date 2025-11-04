
/**
 * Hache un mot de passe en utilisant l'algorithme SHA-256.
 * @param password Le mot de passe en clair à hacher.
 * @returns Une promesse qui se résout avec le hash hexadécimal du mot de passe.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
