import { useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';

/**
 * Refetch a chaque retour sur l'ecran (React Navigation focus),
 * en sautant le premier focus (le mount a deja fetch via useQuery).
 * La fonction peut changer a chaque rendu : on garde la derniere dans une ref,
 * sinon l'effet de focus se relancerait a chaque rendu (boucle de rechargement).
 */
export function useRefreshOnFocus(refetch: () => void) {
  const firstTimeRef = useRef(true);
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;

  useFocusEffect(
    useCallback(() => {
      if (firstTimeRef.current) {
        firstTimeRef.current = false;
        return;
      }
      refetchRef.current();
    }, []),
  );
}
