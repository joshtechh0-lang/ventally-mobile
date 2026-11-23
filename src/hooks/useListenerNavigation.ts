import { useNavigation } from '@react-navigation/native';
import { routes } from '../navigation/routes';

export const useListenerNavigation = () => {
    const navigation = useNavigation();

    const navigateListener = (user: any) => {
        console.log("user in naviagtion", user);

        if (user?.isVerified === false) {
            (navigation as any).navigate(routes.signUpOTP as never, { email: user?.email });
        } else if (user?.verificationDocumentStatus === "pending") {
            (navigation as any).replace(routes.listenerHomeTab as never);
        } else {
            (navigation as any).replace(routes.listenerHomeTab as never);
        }
    };

    return { navigateListener };
};
