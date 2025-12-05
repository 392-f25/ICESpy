import { signInWithGoogle, signOutUser, useAuthState } from '../utilities/firebase';

const AuthButton = () => {
  const { isAuthenticated } = useAuthState();

  const label = isAuthenticated ? 'Log out' : 'Sign in';

  const handleClick = () => {
    if (isAuthenticated) {
      signOutUser();
    } else {
      signInWithGoogle();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-full cursor-pointer border border-white/60 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#4E2A84]"
    >
      {label}
    </button>
  );
};

export default AuthButton;
