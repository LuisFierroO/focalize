import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/infrastructure/db/prisma/client";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Resend({
      from: process.env.RESEND_FROM_EMAIL!,
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        const { Resend: ResendClient } = await import("resend");
        const resend = new ResendClient(process.env.RESEND_API_KEY!);

        const verifyUrl = url.replace(
          /\/api\/auth\/callback\/resend/,
          "/verify"
        );

        await resend.emails.send({
          from: provider.from!,
          to: identifier,
          subject: "Inicia sesión en Focalize",
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 32px;">
              <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Focalize</h1>
              <p style="color: #374151; margin-bottom: 24px;">Haz clic en el botón para iniciar sesión.</p>
              <a href="${verifyUrl}" style="
                display: inline-block;
                background: #1d4ed8;
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
              ">Iniciar sesión</a>
              <p style="color: #9ca3af; font-size: 13px; margin-top: 24px;">
                Si no solicitaste este correo, puedes ignorarlo.<br/>
                El enlace expira en 24 horas.
              </p>
            </div>
          `,
        });
      },
    }),
  ],
});
