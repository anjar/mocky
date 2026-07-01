import Link from "next/link";
import { headers, cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import LoginButton from "@/components/Login/LoginButton";

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const signIn = async (formData: FormData) => {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = await createClient(cookies());

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("error", error);
    console.log("data", data);
    if (error) {
      return redirect("/login?message=Could not authenticate user");
    }

    return redirect("/");
  };

  const signUp = async (formData: FormData) => {
    "use server";

    const headersList = await headers();
    const origin = headersList.get("origin");
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = await createClient(cookies());

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      return redirect("/login?message=Could not authenticate user");
    }

    return redirect("/login?message=Check email to continue sign in process");
  };

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <Link
        href="/"
        className="absolute left-8 top-8 py-2 px-4 rounded-md no-underline text-foreground bg-btn-background hover:bg-btn-background-hover flex items-center group text-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>{" "}
        Back
      </Link>
      
      <LoginButton />

      <div className="flex items-center my-4">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="mx-4 text-sm text-gray-500">or</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <form
        className="animate-in flex-1 flex flex-col w-full justify-center gap-4 text-foreground"
        action={signIn}
      >
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-500" htmlFor="email">
            Email address
          </label>
          <input
            className="rounded-md px-4 py-2 bg-inherit border border-gray-300 text-sm focus:outline-none focus:border-gray-500"
            name="email"
            placeholder="Your email address"
            required
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-500" htmlFor="password">
            Your Password
          </label>
          <input
            className="rounded-md px-4 py-2 bg-inherit border border-gray-300 text-sm focus:outline-none focus:border-gray-500"
            type="password"
            name="password"
            placeholder="Your password"
            required
          />
        </div>

        <button className="bg-[#24b47e] rounded-md px-4 py-2.5 text-white text-sm font-medium hover:bg-[#20a070] transition-colors mt-2">
          Sign in
        </button>

        <div className="flex flex-col items-center gap-3 mt-4 text-sm text-gray-500">
          <Link href="#" className="hover:underline">
            Forgot your password?
          </Link>
          <button formAction={signUp} className="hover:underline">
            Don't have an account? Sign up
          </button>
        </div>
       
        {resolvedSearchParams?.message && (
          <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center text-sm">
            {resolvedSearchParams.message}
          </p>
        )}
      </form>
    </div>
  );
}
