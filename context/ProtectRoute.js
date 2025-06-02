import { useContext, useEffect } from "react";
import { useRouter } from "next/router";
import AuthContext from "./AuthContext";
import ROUTES from "@/lib/routes";

const ProtectedRoute = (WrappedComponent) => {
  return function ProtectedComponent(props) {
    const { user, loading } = useContext(AuthContext);
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        // router.push("/"); // Redirect to login if user is not authenticated
        router.push(ROUTES.HOME);
      }
    }, [user, loading, router]);

    if (loading || !user) {
      return <p className="text-center mt-10">Loading...</p>; // Show a loading message
    }

    return <WrappedComponent {...props} />;
  };
};

export default ProtectedRoute;
