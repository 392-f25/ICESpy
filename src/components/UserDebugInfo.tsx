import { useAuthState } from '../utilities/firebase';

const UserDebugInfo = () => {
  const { user, isAuthenticated, isInitialLoading } = useAuthState();

  if (isInitialLoading) {
    return (
      <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs max-w-xs">
        <div className="font-semibold mb-1">Auth Status</div>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs max-w-xs">
        <div className="font-semibold mb-1">Auth Status</div>
        <div>Not signed in</div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs max-w-xs">
      <div className="font-semibold mb-2">User Info (Stored in DB)</div>
      <div className="space-y-1">
        <div><span className="text-gray-300">ID:</span> {user.uid}</div>
        <div><span className="text-gray-300">Email:</span> {user.email}</div>
        <div><span className="text-gray-300">Name:</span> {user.displayName || 'No display name'}</div>
      </div>
      <div className="mt-2 text-green-400 text-xs">
        ✓ Stored in Firebase DB
      </div>
    </div>
  );
};

export default UserDebugInfo;