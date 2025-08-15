import { useContext, useEffect } from "react";
import { useRouter } from "next/router";
import AuthContext from "./AuthContext";
import ROUTES from "@/lib/routes";
import Loader from "@/components/resuable/Loader";

const ProtectedRoute = (WrappedComponent) => {
  return function ProtectedComponent(props) {
    const { user, loading } = useContext(AuthContext);
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push(ROUTES.HOME); // Redirect to login if user is not authenticated
      }
    }, [user, loading, router]);

    if (loading || !user) {
      return <Loader />
    }

    return <WrappedComponent {...props} />;
  };
};

export default ProtectedRoute;
