import { redirect } from "next/navigation";
import { verifyToken, COOKIE_NAME, getUsers } from "@/trip/auth";
import { cookies } from "next/headers";

export default async function ProfileRedirect() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value ?? "";
  const isAdmin = verifyToken(token);

  let userId = 0;
  if (isAdmin && token) {
    const parts = token.split(".");
    if (parts[0]) {
      const payload = parts[0];
      const match = payload.match(/^admin:(.+):\d+$/);
      if (match) {
        const email = match[1].toLowerCase();
        const users = getUsers();
        for (const user of Object.values(users)) {
          if (user.email.toLowerCase() === email) {
            userId = user.id;
            break;
          }
        }
      }
    }
  }

  if (isAdmin && userId) {
    redirect(`/trip/profile/${userId}`);
  } else {
    redirect("/trip/login");
  }
}
