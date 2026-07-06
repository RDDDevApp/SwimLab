import { useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';

/**
 * Refetch a chaque retour sur l'ecran (React Navigation focus),
 * en sautant le premier focus (le mount a deja fetch via useQuery).
 */
export function useRefreshOnFocus(refetch: () => void) {
  const firstTimeRef = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (firstTimeRef.current) {
        firstTimeRef.current = false;
        return;
      }
      refetch();
    }, [refetch]),
  );
}
