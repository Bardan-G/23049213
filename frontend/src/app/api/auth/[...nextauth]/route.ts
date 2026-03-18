import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || 'clientid_placeholder',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'clientsecret_placeholder',
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                        method: "POST",
                        body: JSON.stringify(credentials),
                        headers: { "Content-Type": "application/json" },
                    });

                    const user = await res.json();

                    // If no error and we have user data, return it
                    if (res.ok && user) {
                        return user;
                    }
                    return null;
                } catch (e) {
                    console.error("Login Failed:", e);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === 'google') {
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
                        method: 'POST',
                        body: JSON.stringify({
                            email: user.email,
                            name: user.name,
                            image: user.image
                        }),
                        headers: { 'Content-Type': 'application/json' }
                    });

                    if (res.ok) {
                        const data = await res.json();
                        (user as any).access_token = data.access_token;
                        (user as any).user = data.user;
                        return true;
                    }
                    return false;
                } catch (e) {
                    console.error("Google sync failed", e);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.accessToken = (user as any).access_token;
                token.role = (user as any).user.role; // Extract role from backend response
                token.id = (user as any).user.id;
                token.name = (user as any).user.name; // Capture name
            }
            return token;
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken as string;
            session.user.id = token.id as string;
            session.user.role = token.role as 'admin' | 'customer'; // Pass to session
            session.user.name = token.name as string; // Pass name to session
            return session;
        },
    },
    pages: {
        signIn: "/auth/login",
    },
});

export { handler as GET, handler as POST };
