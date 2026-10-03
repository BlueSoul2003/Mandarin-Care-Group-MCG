type LogoutAuth = { signOut(): Promise<{ error: unknown }> }

// Keep the visible identity until the provider confirms session termination.
export async function logoutWithFeedback(
  auth: LogoutAuth,
  onSuccess: () => void,
  onFailure: () => void,
): Promise<void> {
  try {
    const { error } = await auth.signOut()
    if (error) {
      onFailure()
      return
    }
  } catch {
    onFailure()
    return
  }
  onSuccess()
}
