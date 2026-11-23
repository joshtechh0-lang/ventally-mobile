/**
 * Agora constants and re-export of useAgora hook.
 * Use the hook anywhere: import { useAgora } from '../hooks/useAgora'
 * or import { useAgora, AGORA_APP_ID } from '../constants/Agora'
 */

export { useAgora, type UseAgoraOptions, type JoinChannelParams } from '../hooks/useAgora';

export const AGORA_APP_ID = '25832db4fae5418f977c634900af9904';

/** Hardcoded for testing only – same token + channel so both users join the same call. Remove when using API. */
export const TEST_AGORA_TOKEN = '007eJxTYDhmW9a1Zs9avbOft6z8kS4VclPp3ocSkS8PJO1WODjmMRgpMCSaWpqZp1gaWZoapZmkmCRbmpulpRklpaSZmluYGicZ7u1an9kQyMjw+rwtKyMDBIL43AwlqcUlzhmJeXmpOQwMALwGI+w=';
export const TEST_AGORA_CHANNEL = 'testChannel';
