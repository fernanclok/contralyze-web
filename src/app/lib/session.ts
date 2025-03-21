import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import {clearLocalStorage} from "@/lib/client-utils";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export async function createSession(
  userId: string,
  role: string,
  userFirstName: string,
  userLastName: string
) {
  const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours
  const session = await encrypt({
    userId,
    role,
    expiresAt,
    userFirstName,
    userLastName,
  });

  (await cookies()).set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
  });
}

export async function storeTokenBackend(token: string) {
  const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours
  (await cookies()).set("access_token", token, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
  });
}

export async function deleteSession() {
  (await cookies()).delete("session");
  (await cookies()).delete("access_token");
   // clean the local storage
   if (typeof window !== "undefined") {
    clearLocalStorage();
  }
}

type SessionPayload = {
  userId: string;
  role: string;
  userFirstName: string;
  userLastName: string;
  expiresAt: Date;
};

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    console.log("Failed to verify session");
    return null;
  }
}
 
export async function getSession() {
  const cookie = await decrypt((await cookies()).get("session")?.value);
  if (!cookie) return null; // Si no hay cookie, retornamos null

  return {
    id: cookie.userId,
    role: typeof cookie.role === "string" ? cookie.role : "guest",
    userFirstName: cookie.userFirstName || "",
    userLastName: cookie.userLastName || "",
  };
}
