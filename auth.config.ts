import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    verifyRequest: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth }) {
      return !!auth;
    },
    signIn({ user }) {
      return user.email === process.env.ALLOWED_EMAIL;
    },
  },
};
