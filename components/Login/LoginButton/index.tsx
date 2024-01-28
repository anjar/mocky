'use client';
import { createClient } from '@/utils/supabase/client';
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa, ThemeMinimal } from '@supabase/auth-ui-shared'

const LoginButton = () => {
  const supabase = createClient();
  // const handleGitHubLogin = async () => {
  //   const supabase = createClient();

	// 	const { error } = await supabase.auth.signInWithOAuth({
	// 		provider: 'github'
	// 	});

	// 	if (error) {
	// 		console.log({ error });
	// 	}
	// };
  // const handleGoogleLogin = async (response) => {
  //   const supabase = createClient();
  //   console.log("response", response)

  //   const { data, error } = await supabase.auth.signInWithIdToken({
  //     provider: 'google',
  //     token: response.credential,
  //     nonce: 'NONCE', // must be the same one as provided in data-nonce (if any)
  //   })

	// 	if (error) {
	// 		console.log({ error });
	// 	}
	// };

  return (
		<>
     <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={['google', 'github']}
        redirectTo="http://www.mocky.loc/auth/callback"
      />
			{/* <button onClick={handleGitHubLogin}>GitHub Login</button>
      < hr/> */}
      {/* <div>
        <div id="g_id_onload"
            data-client_id="789985307428-0u8cbts7t1bu4m3p2nlsvv7ga5lhuqob.apps.googleusercontent.com"
            data-context="signin"
            data-ux_mode="popup"
            data-callback="handleGoogleLogin"
            data-nonce=""
            data-auto_select="true"
            data-itp_support="true">
        </div>

        <div className="g_id_signin"
            data-type="standard"
            data-shape="rectangular"
            data-theme="filled_blue"
            data-text="signin_with"
            data-size="large"
            data-logo_alignment="left">
        </div>
      </div> */}
		</>
	);
}

export default LoginButton;