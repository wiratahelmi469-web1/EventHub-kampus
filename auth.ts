import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Configure Env variables for proxy-friendly NextAuth v5 routing
if (process.env.APP_URL) {
  if (!process.env.AUTH_URL) process.env.AUTH_URL = process.env.APP_URL;
  if (!process.env.NEXTAUTH_URL) process.env.NEXTAUTH_URL = process.env.APP_URL;
}
process.env.AUTH_TRUST_HOST = "true";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        const DEMO_USERS = [
          { id: "1", name: "Project Officer", email: "po@nurulfikri.ac.id", password: "po123", role: "po" },
          { id: "2", name: "Divisi Acara", email: "panitia@nurulfikri.ac.id", password: "panitia123", role: "panitia" },
          { id: "3", name: "Budi Santoso", email: "mahasiswa@nurulfikri.ac.id", password: "mhs123", role: "mahasiswa" },
          { id: "4", name: "Staf Kemahasiswaan", email: "staff@nurulfikri.ac.id", password: "staff123", role: "staf" },
        ];

        // 1. Check demo users first
        const demoUser = DEMO_USERS.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (demoUser) {
          return {
            id: demoUser.id,
            name: demoUser.name,
            email: demoUser.email,
            role: demoUser.role,
          };
        }

        // 2. Client-side verified registered users passed dynamically
        if (credentials.role && credentials.name) {
          return {
            id: email,
            name: credentials.name as string,
            email: email,
            role: credentials.role as string,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
    callbackUrl: {
      name: "next-auth.callback-url",
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
    csrfToken: {
      name: "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET || "development-secret-key-must-be-at-least-32-characters-long-123456",
});
