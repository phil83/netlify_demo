export async function requireUser(context) {
  // Netlify Identity automatically injects authenticated user details into
  // the Function context when the request includes a valid Bearer token.
  const user = context?.clientContext?.user;

  if (!user) {
    return {
      error: Response.json({ error: 'Unauthorized. Please log in first.' }, { status: 401 }),
    };
  }

  return {
    user: {
      id: user.sub,
      email: user.email,
      roles: user.app_metadata?.roles || [],
    },
  };
}
