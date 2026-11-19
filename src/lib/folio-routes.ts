/** These routes share the editorial shell rather than the legacy service chrome. */
export const isEditorialRoute = (path: string | null) =>
  path === "/" ||
  path === "/projects" ||
  path === "/about" ||
  path === "/library" ||
  path === "/market";
