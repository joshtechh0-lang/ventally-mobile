import { useNavigation } from '@react-navigation/native';
import { routes } from '../navigation/routes';
import { useSelector } from 'react-redux';

export const useVenterNavigation = () => {
    const navigation = useNavigation();
    const { preferredLanguage } = useSelector((state: any) => state.app);

    const navigateVenter = (user: any) => {
        console.log("user in navigation", user);
        if (user?.isVerified === false) {
            (navigation as any).navigate(routes.signUpOTP as never, { email: user?.email });
        } else {
            (navigation as any).replace(routes.venterHomeTab as never);
        }
    };

    return { navigateVenter };
};
